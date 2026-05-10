/**
 * Migration Script: Assign doctorId to existing Patient and Billing records
 * 
 * This script:
 * 1. Drops the old unique index on Patient.phone (was global, now per-doctor)
 * 2. Assigns all orphan patients/billings (no doctorId) to the first doctor found
 * 3. Creates the new compound index (phone + doctorId)
 * 
 * Usage: node scripts/migrate-doctor-isolation.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const Billing = require('../models/Billing');
const Doctor = require('../models/Doctor');

const run = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the first/test doctor to assign orphan records to
    const testDoctor = await Doctor.findOne({ email: 'test@medisynx.ai' });
    if (!testDoctor) {
      // Fall back to first doctor
      const firstDoctor = await Doctor.findOne({});
      if (!firstDoctor) {
        console.error('No doctors found in the database. Please create a doctor account first.');
        process.exit(1);
      }
      console.log(`Using first doctor: ${firstDoctor.name} (${firstDoctor._id})`);
      var targetDoctorId = firstDoctor._id;
    } else {
      console.log(`Using test doctor: ${testDoctor.name} (${testDoctor._id})`);
      var targetDoctorId = testDoctor._id;
    }

    // Step 1: Drop old unique index on Patient.phone if it exists
    console.log('\n--- Step 1: Dropping old unique index on Patient.phone ---');
    try {
      const patientIndexes = await Patient.collection.indexes();
      const phoneIndex = patientIndexes.find(idx => idx.key && idx.key.phone && !idx.key.doctorId);
      if (phoneIndex) {
        await Patient.collection.dropIndex(phoneIndex.name);
        console.log(`Dropped old index: ${phoneIndex.name}`);
      } else {
        console.log('No old phone-only unique index found (already clean)');
      }
    } catch (err) {
      console.log('Index drop skipped:', err.message);
    }

    // Step 2: Assign doctorId to orphan patients
    console.log('\n--- Step 2: Migrating orphan patients ---');
    const orphanPatients = await Patient.find({ doctorId: { $exists: false } });
    console.log(`Found ${orphanPatients.length} patients without doctorId`);
    
    if (orphanPatients.length > 0) {
      const result = await Patient.updateMany(
        { doctorId: { $exists: false } },
        { $set: { doctorId: targetDoctorId } }
      );
      console.log(`Updated ${result.modifiedCount} patients with doctorId`);
    }

    // Also fix patients where doctorId is null
    const nullPatients = await Patient.find({ doctorId: null });
    if (nullPatients.length > 0) {
      const result = await Patient.updateMany(
        { doctorId: null },
        { $set: { doctorId: targetDoctorId } }
      );
      console.log(`Updated ${result.modifiedCount} patients with null doctorId`);
    }

    // Step 3: Assign doctorId to orphan billings
    console.log('\n--- Step 3: Migrating orphan billings ---');
    const orphanBillings = await Billing.find({ $or: [{ doctorId: { $exists: false } }, { doctorId: null }] });
    console.log(`Found ${orphanBillings.length} billings without doctorId`);
    
    if (orphanBillings.length > 0) {
      const result = await Billing.updateMany(
        { $or: [{ doctorId: { $exists: false } }, { doctorId: null }] },
        { $set: { doctorId: targetDoctorId } }
      );
      console.log(`Updated ${result.modifiedCount} billings with doctorId`);
    }

    // Step 4: Ensure new compound index exists
    console.log('\n--- Step 4: Creating compound index (phone + doctorId) ---');
    try {
      await Patient.collection.createIndex({ phone: 1, doctorId: 1 }, { unique: true });
      console.log('Compound index created successfully');
    } catch (err) {
      console.log('Index creation note:', err.message);
    }

    // Summary
    console.log('\n========== Migration Complete ==========');
    const totalPatients = await Patient.countDocuments();
    const totalBillings = await Billing.countDocuments();
    const patientsWithDoctor = await Patient.countDocuments({ doctorId: { $exists: true, $ne: null } });
    const billingsWithDoctor = await Billing.countDocuments({ doctorId: { $exists: true, $ne: null } });
    
    console.log(`Patients: ${patientsWithDoctor}/${totalPatients} have doctorId`);
    console.log(`Billings: ${billingsWithDoctor}/${totalBillings} have doctorId`);
    console.log('=========================================');

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

run();

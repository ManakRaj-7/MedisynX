const diagnosisService = require('../../ai-service/diagnosisService');

exports.diagnose = async (req, res, next) => {
  try {
    const { symptoms, age, gender, history } = req.body;
    if (!symptoms) {
      return res.status(400).json({ message: 'Symptoms are required for diagnosis.' });
    }

    const result = await diagnosisService.getDiagnosis({ symptoms, age, gender, history });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

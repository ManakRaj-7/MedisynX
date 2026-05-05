const fs = require('fs').promises;
const path = require('path');
const fetch = global.fetch || require('node-fetch');

const cachePath = path.join(__dirname, 'cache.json');
let cache = {};

const loadCache = async () => {
  try {
    const data = await fs.readFile(cachePath, 'utf8');
    cache = JSON.parse(data || '{}');
  } catch (error) {
    cache = {};
    await saveCache();
  }
};

const saveCache = async () => {
  await fs.writeFile(cachePath, JSON.stringify(cache, null, 2), 'utf8');
};

const normalizeSymptoms = (symptoms) => {
  return symptoms
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9 ,.-]/g, '');
};

const getCacheKey = (payload) => {
  const symptomText = normalizeSymptoms(payload.symptoms || '');
  const age = payload.age || 'unknown';
  const gender = (payload.gender || 'unknown').toLowerCase();
  return `${symptomText}|${age}|${gender}`;
};

const fallbackDiagnosis = (symptoms) => {
  const text = normalizeSymptoms(symptoms);

  if (text.includes('fever') && text.includes('cough')) {
    return {
      source: 'fallback',
      diagnosis: 'Likely viral illness such as flu or common cold. Recommend rest, fluids, and monitoring for worsening symptoms.',
      advice: 'If symptoms persist more than 3 days or breathing difficulty develops, seek medical evaluation.',
    };
  }

  if (text.includes('chest pain') || text.includes('pressure in chest') || text.includes('shortness of breath')) {
    return {
      source: 'fallback',
      diagnosis: 'Possible cardiac issue. This requires urgent medical evaluation.',
      advice: 'Refer the patient to emergency care immediately and obtain ECG and cardiac enzyme tests.',
    };
  }

  if (text.includes('headache') && text.includes('nausea')) {
    return {
      source: 'fallback',
      diagnosis: 'Symptoms are consistent with migraine. Consider lifestyle triggers and pain management.',
      advice: 'Recommend hydration, rest in a quiet dark room, and a migraine-specific analgesic if appropriate.',
    };
  }

  return null;
};

const callGeminiAPI = async (payload) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured.');
  }

  const prompt = `You are a clinical decision support assistant. Based on the following information, provide a short diagnosis summary and recommended next steps.\n\nSymptoms: ${payload.symptoms}\nAge: ${payload.age || 'unknown'}\nGender: ${payload.gender || 'unknown'}\nMedical history: ${payload.history || 'none'}`;

  const url = `https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generate?key=${process.env.GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: {
        text: prompt,
      },
      temperature: 0.2,
      maxOutputTokens: 250,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini API request failed: ${response.status} ${body}`);
  }

  const data = await response.json();
  const output = data?.candidates?.[0]?.content || data?.output?.[0]?.content || '';
  return output.trim();
};

const getDiagnosis = async (payload) => {
  if (!payload.symptoms) {
    throw new Error('Symptoms are required for diagnosis.');
  }

  await loadCache();
  const cacheKey = getCacheKey(payload);

  if (cache[cacheKey]) {
    return { ...cache[cacheKey], cached: true };
  }

  const fallback = fallbackDiagnosis(payload.symptoms);
  if (fallback) {
    cache[cacheKey] = { ...fallback, cached: false };
    await saveCache();
    return cache[cacheKey];
  }

  try {
    const diagnosisText = await callGeminiAPI(payload);
    const result = {
      source: 'gemini',
      diagnosis: diagnosisText,
      advice: 'Review the response with a medical professional before taking action.',
      cached: false,
    };
    cache[cacheKey] = result;
    await saveCache();
    return result;
  } catch (error) {
    const fallbackResult = {
      source: 'fallback',
      diagnosis: 'The AI service is unavailable. Use clinical judgment and consult a physician.',
      advice: 'Please retry later or use the fallback evaluation guidance in the app.',
      error: error.message,
      cached: false,
    };
    cache[cacheKey] = fallbackResult;
    await saveCache();
    return fallbackResult;
  }
};

module.exports = {
  getDiagnosis,
};

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;
const path = require('path');

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
      content: '### Potential Assessment\nLikely viral illness such as flu or common cold.\n\n### Recommended Next Steps\n- Rest, fluids, and monitoring\n- If symptoms persist >3 days, escalate',
      confidence: 65,
      disclaimer: 'Fallback analysis — AI service was unavailable.',
    };
  }

  if (text.includes('chest pain') || text.includes('pressure in chest') || text.includes('shortness of breath')) {
    return {
      source: 'fallback',
      content: '### ⚠️ URGENT — Potential Cardiac Event\nChest pain/pressure requires immediate evaluation.\n\n### Recommended Next Steps\n- Refer to ER immediately\n- Obtain ECG and cardiac enzyme tests',
      confidence: 85,
      disclaimer: 'Fallback analysis — seek emergency care.',
    };
  }

  if (text.includes('headache') && text.includes('nausea')) {
    return {
      source: 'fallback',
      content: '### Potential Assessment\nSymptoms consistent with migraine.\n\n### Recommended Next Steps\n- Hydration, rest in a quiet dark room\n- Consider migraine-specific analgesic',
      confidence: 60,
      disclaimer: 'Fallback analysis — AI service was unavailable.',
    };
  }

  return null;
};

const callGeminiAPI = async (payload) => {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set in environment variables');
    throw new Error('Gemini API key is not configured.');
  }

  // Debug: confirm key is loaded (first 8 chars only for security)
  console.log('Gemini API Key loaded:', process.env.GEMINI_API_KEY.substring(0, 8) + '...');
  console.log('Calling Gemini with model: gemini-1.5-flash');

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are MedisynX AI, an advanced clinical decision support system.
Analyze the patient data below and return a structured medical insight in Markdown.

PATIENT DATA:
- Symptoms: ${payload.symptoms}
- Age: ${payload.age || 'Not provided'}
- Gender: ${payload.gender || 'Not provided'}
- Medical History: ${payload.history || 'None reported'}

RESPONSE FORMAT (use exactly these headers):

### 🔍 Potential Assessment
[2-3 sentences on what these symptoms might indicate, including differential diagnoses]

### 📊 Confidence Level
[State a confidence percentage 0-100% and briefly explain why]

### 🔬 Key Considerations
- [List 3-4 important clinical points the doctor should consider]

### 📋 Recommended Tests
- [List 2-3 specific diagnostic tests or examinations]

### 💊 Suggested Next Steps
- [List 2-3 actionable clinical steps]

### ⚠️ Red Flags
- [List symptoms that would require immediate emergency attention]

### 🍎 Lifestyle & Diet Recommendations
- [List 2-3 diet/lifestyle suggestions relevant to the condition]

Keep the response professional, evidence-informed, and concise.
End with: *"⚕️ This is an AI-assisted clinical insight and must be validated by a licensed healthcare professional before any clinical decision."*`;

  // Retry logic for rate limit (429) errors on free tier
  const MAX_RETRIES = 2;
  const RETRY_DELAYS = [2000, 5000]; // 2s, then 5s

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Try to extract confidence from the AI's response
      let confidence = 75; // default
      const confMatch = text.match(/(\d{1,3})\s*%/);
      if (confMatch) {
        const parsed = parseInt(confMatch[1]);
        if (parsed >= 0 && parsed <= 100) confidence = parsed;
      }

      console.log('Gemini response received successfully, confidence:', confidence);
      return { text, confidence };
    } catch (error) {
      const isRateLimit = error.status === 429 || error.message?.includes('429') || error.message?.includes('Too Many');
      
      if (isRateLimit && attempt < MAX_RETRIES) {
        const delay = RETRY_DELAYS[attempt];
        console.warn(`Rate limited (429). Retrying in ${delay / 1000}s... (attempt ${attempt + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Log the FULL error object for debugging — don't hide it
      console.error('FULL GEMINI ERROR:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      if (error.status) console.error('Error status:', error.status);
      if (error.statusText) console.error('Error statusText:', error.statusText);
      if (error.errorDetails) console.error('Error details:', JSON.stringify(error.errorDetails));
      throw error;
    }
  }
};

const getDiagnosis = async (payload) => {
  if (!payload.symptoms) {
    throw new Error('Symptoms are required for analysis.');
  }

  await loadCache();
  const cacheKey = getCacheKey(payload);

  // Only return cached results if they were successful (not error responses)
  if (cache[cacheKey] && cache[cacheKey].source !== 'error-handler') {
    return { ...cache[cacheKey], cached: true };
  }

  try {
    const { text, confidence } = await callGeminiAPI(payload);
    const result = {
      source: 'gemini-1.5-flash',
      content: text,
      confidence,
      disclaimer: 'This insight is generated by AI and must be reviewed by a qualified healthcare professional before any clinical decision.',
      timestamp: new Date().toISOString(),
      cached: false,
    };
    cache[cacheKey] = result;
    await saveCache();
    return result;
  } catch (error) {
    const fallback = fallbackDiagnosis(payload.symptoms);
    if (fallback) {
      return { ...fallback, cached: false };
    }

    // Do NOT cache error responses — so retries can succeed after fix
    return {
      source: 'error-handler',
      content: '### Service Unavailable\nThe AI service is currently experiencing high load. Please rely on clinical judgment and try again later.',
      confidence: 0,
      disclaimer: 'AI service unavailable.',
      error: error.message,
      cached: false,
    };
  }
};

module.exports = {
  getDiagnosis,
};

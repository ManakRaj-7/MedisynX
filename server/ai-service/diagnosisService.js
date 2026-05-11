const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;
const path = require('path');
const OpenAI = require('openai');

const OPENROUTER_MODELS = [
  "nvidia/nemotron-3-super-120b-a12b:free",
  "google/gemma-4-26b-a4b-it:free",
  "inclusionai/ring-2.6-1t:free",
  "baidu/cobuddy:free"
];

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

const callOpenRouterAPI = async (prompt) => {
  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === "missing") {
    throw new Error('OpenRouter API key is not configured.');
  }

  const openRouterClient = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:5173",
      "X-Title": "MedisynX",
    },
  });

  for (const modelName of OPENROUTER_MODELS) {
    try {
      console.log(`Calling OpenRouter with model: ${modelName}`);
      const completion = await openRouterClient.chat.completions.create({
        model: modelName,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1200,
      });
      
      const text = completion.choices?.[0]?.message?.content;
      if (!text || !text.trim()) {
        throw new Error('OpenRouter returned an empty response.');
      }
      
      let confidence = 75;
      const confMatch = text.match(/(\d{1,3})\s*%/);
      if (confMatch) {
        const parsed = parseInt(confMatch[1]);
        if (parsed >= 0 && parsed <= 100) confidence = parsed;
      }
      
      console.log(`OpenRouter (${modelName}) response successfully received. Confidence: ${confidence}`);
      return { text, confidence, modelUsed: modelName };
    } catch (error) {
      console.warn(`OpenRouter model ${modelName} failed. Trying next...`);
      console.error(error.message);
    }
  }
  throw new Error("All OpenRouter models failed.");
};

const callGeminiAPI = async (prompt) => {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set in environment variables');
    throw new Error('Gemini API key is not configured.');
  }

  console.log('Gemini API Key loaded:', process.env.GEMINI_API_KEY.substring(0, 8) + '...');
  console.log('Calling Gemini with model: gemini-2.5-flash');

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const MAX_RETRIES = 2;
  const RETRY_DELAYS = [2000, 5000];

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      let confidence = 75;
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

      console.error('FULL GEMINI ERROR:', error);
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

  if (cache[cacheKey] && cache[cacheKey].source !== 'error-handler') {
    return { ...cache[cacheKey], cached: true };
  }

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

  let sourceUsed = '';
  let finalResult = null;

  try {
    // OpenRouter is the primary provider. Gemini is kept as a fallback provider.
    const { text, confidence, modelUsed } = await callOpenRouterAPI(prompt);
    sourceUsed = modelUsed;
    finalResult = { text, confidence };
  } catch (openRouterError) {
    console.log("OpenRouter failed. Falling back to Gemini 2.5 Flash...");
    try {
      const { text, confidence } = await callGeminiAPI(prompt);
      sourceUsed = 'gemini-2.5-flash';
      finalResult = { text, confidence };
    } catch (geminiError) {
      const fallback = fallbackDiagnosis(payload.symptoms);
      if (fallback) {
        return { ...fallback, cached: false };
      }

      return {
        source: 'error-handler',
        content: '### Service Unavailable\nThe AI service is currently experiencing high load. Please rely on clinical judgment and try again later.',
        confidence: 0,
        disclaimer: 'AI service unavailable.',
        error: geminiError.message || openRouterError.message,
        cached: false,
      };
    }
  }

  const result = {
    source: sourceUsed,
    content: finalResult.text,
    confidence: finalResult.confidence,
    disclaimer: 'This insight is generated by AI and must be reviewed by a qualified healthcare professional before any clinical decision.',
    timestamp: new Date().toISOString(),
    cached: false,
  };
  cache[cacheKey] = result;
  await saveCache();
  return result;
};

module.exports = {
  getDiagnosis,
};

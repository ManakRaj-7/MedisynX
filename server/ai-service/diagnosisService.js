const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;
const path = require('path');
const OpenAI = require('openai');

const OPENROUTER_MODELS = [
  'nvidia/nemotron-3-super-120b-a12b:free',
  'google/gemma-4-26b-a4b-it:free',
];

const OPENROUTER_MODEL_TIMEOUT_MS = Number(process.env.OPENROUTER_MODEL_TIMEOUT_MS || 3500);
const OPENROUTER_HEAD_START_MS = Number(process.env.OPENROUTER_HEAD_START_MS || 1200);
const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 6000);

const cachePath = path.join(__dirname, 'cache.json');
let cache = {};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withTimeout = (promise, ms, label) => {
  return Promise.race([
    promise,
    delay(ms).then(() => {
      throw new Error(`${label} timed out after ${ms}ms`);
    }),
  ]);
};

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
      disclaimer: 'Fallback analysis - AI providers were unavailable.',
    };
  }

  if (text.includes('chest pain') || text.includes('pressure in chest') || text.includes('shortness of breath')) {
    return {
      source: 'fallback',
      content: '### URGENT - Potential Cardiac Event\nChest pain/pressure requires immediate evaluation.\n\n### Recommended Next Steps\n- Refer to ER immediately\n- Obtain ECG and cardiac enzyme tests',
      confidence: 85,
      disclaimer: 'Fallback analysis - seek emergency care.',
    };
  }

  if (text.includes('headache') && text.includes('nausea')) {
    return {
      source: 'fallback',
      content: '### Potential Assessment\nSymptoms are consistent with migraine, though other causes should be considered if severe or new.\n\n### Recommended Next Steps\n- Hydration and rest in a quiet dark room\n- Consider migraine-specific analgesic if appropriate',
      confidence: 60,
      disclaimer: 'Fallback analysis - AI providers were unavailable.',
    };
  }

  if (
    text.includes('knee pain') ||
    text.includes('ankle pain') ||
    text.includes('shoulder pain') ||
    text.includes('back pain') ||
    (text.includes('pain') && (text.includes('running') || text.includes('exercise') || text.includes('strain')))
  ) {
    return {
      source: 'fast-fallback',
      content: `### Potential Assessment
The symptoms suggest a musculoskeletal strain or overuse injury, especially if pain started after activity. Differential diagnoses include ligament sprain, tendon irritation, muscle strain, bursitis, or joint inflammation depending on location and examination findings.

### Confidence Level
55% - The activity-related pattern supports a musculoskeletal cause, but localization, swelling, range of motion, and trauma history are needed.

### Key Considerations
- Ask about exact location, swelling, instability, locking, numbness, weakness, and ability to bear weight.
- Check whether pain began suddenly after trauma or gradually after repetitive activity.
- Review prior injuries, training changes, footwear, and current medications.

### Recommended Tests
- Focused musculoskeletal exam with range of motion and stability testing.
- X-ray if there was trauma, inability to bear weight, deformity, or bony tenderness.
- Consider ultrasound or MRI if symptoms persist or soft-tissue injury is suspected.

### Suggested Next Steps
- Rest the affected area, apply ice, use compression/elevation if swollen, and consider analgesics if appropriate.
- Avoid aggravating activity until pain and function improve.
- Follow up within 24-72 hours if pain is severe, worsening, or limiting movement.

### Red Flags
- Deformity, inability to bear weight, rapidly increasing swelling, fever, severe weakness, numbness, or loss of pulses.

### Lifestyle & Diet Recommendations
- Hydrate, sleep well, and return to activity gradually.
- Use proper warm-up, supportive footwear, and training load progression.`,
      confidence: 55,
      disclaimer: 'Fast fallback analysis - AI providers were unavailable or slow.',
    };
  }

  return {
    source: 'fallback',
    content: `### Potential Assessment
The symptom description is too limited for a confident diagnosis. Consider common causes based on location, onset, duration, severity, triggers, associated symptoms, and relevant history.

### Confidence Level
25% - More clinical detail is needed before narrowing the differential.

### Key Considerations
- Ask about exact location, duration, severity, progression, and triggers.
- Check for fever, shortness of breath, chest pain, neurologic symptoms, vomiting, rash, or trauma.
- Review current medications, allergies, chronic conditions, and recent exposures.

### Recommended Tests
- Full vitals and focused physical examination.
- Basic labs or targeted imaging only if clinical examination suggests a specific concern.

### Suggested Next Steps
- Collect a more specific symptom history.
- Provide symptomatic care if no red flags are present.
- Reassess promptly if symptoms worsen or new warning signs appear.

### Red Flags
- Severe or sudden symptoms, chest pain, breathing difficulty, fainting, confusion, neurologic weakness, uncontrolled bleeding, or persistent high fever.

### Lifestyle & Diet Recommendations
- Rest, hydrate, and avoid strenuous activity until the symptom pattern is clearer.`,
    confidence: 25,
    disclaimer: 'Fallback analysis - AI providers were unavailable or the symptom description was too vague.',
  };
};

const extractConfidence = (text, defaultConfidence = 75) => {
  const confMatch = text.match(/(\d{1,3})\s*%/);
  if (!confMatch) return defaultConfidence;

  const parsed = parseInt(confMatch[1], 10);
  return parsed >= 0 && parsed <= 100 ? parsed : defaultConfidence;
};

const callOpenRouterAPI = async (prompt) => {
  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'missing') {
    throw new Error('OpenRouter API key is not configured.');
  }

  const openRouterClient = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173',
      'X-Title': 'MedisynX',
    },
  });

  for (const modelName of OPENROUTER_MODELS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), OPENROUTER_MODEL_TIMEOUT_MS);

    try {
      console.log(`Calling OpenRouter with model: ${modelName}`);
      const completion = await openRouterClient.chat.completions.create({
        model: modelName,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 550,
      }, { signal: controller.signal });

      const text = completion.choices?.[0]?.message?.content;
      if (!text || !text.trim()) {
        throw new Error('OpenRouter returned an empty response.');
      }

      const confidence = extractConfidence(text);
      console.log(`OpenRouter (${modelName}) response successfully received. Confidence: ${confidence}`);
      return { text, confidence, modelUsed: modelName };
    } catch (error) {
      console.warn(`OpenRouter model ${modelName} failed. Trying next...`);
      console.error(error.message);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error('All OpenRouter models failed.');
};

const callGeminiAPI = async (prompt) => {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set in environment variables');
    throw new Error('Gemini API key is not configured.');
  }

  console.log('Calling Gemini with model: gemini-2.5-flash');

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const MAX_RETRIES = 1;
  const RETRY_DELAY = 1500;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const confidence = extractConfidence(text);

      console.log('Gemini response received successfully, confidence:', confidence);
      return { text, confidence };
    } catch (error) {
      const isRateLimit = error.status === 429 || error.message?.includes('429') || error.message?.includes('Too Many');

      if (isRateLimit && attempt < MAX_RETRIES) {
        console.warn(`Gemini rate limited. Retrying in ${RETRY_DELAY / 1000}s...`);
        await delay(RETRY_DELAY);
        continue;
      }

      console.error('Gemini failed:', error.message);
      throw error;
    }
  }
};

const firstSuccessfulProvider = async (prompt) => {
  const openRouterPromise = callOpenRouterAPI(prompt).then(({ text, confidence, modelUsed }) => ({
    text,
    confidence,
    source: modelUsed,
  }));

  const geminiPromise = delay(OPENROUTER_HEAD_START_MS)
    .then(() => withTimeout(callGeminiAPI(prompt), GEMINI_TIMEOUT_MS, 'Gemini'))
    .then(({ text, confidence }) => ({
      text,
      confidence,
      source: 'gemini-2.5-flash',
    }));

  return Promise.any([openRouterPromise, geminiPromise]);
};

const buildPrompt = (payload) => {
  return `You are MedisynX AI, a clinical decision support assistant.
Return a concise medical insight in Markdown for a licensed clinician.

PATIENT DATA:
- Symptoms: ${payload.symptoms}
- Age: ${payload.age || 'Not provided'}
- Gender: ${payload.gender || 'Not provided'}
- Medical History: ${payload.history || 'None reported'}

Use exactly these headers:

### Potential Assessment
[2 concise sentences with likely causes and differential diagnoses]

### Confidence Level
[State a confidence percentage 0-100% and briefly explain why]

### Key Considerations
- [3 important clinical points]

### Recommended Tests
- [2-3 targeted diagnostic tests or examinations]

### Suggested Next Steps
- [2-3 actionable clinical steps]

### Red Flags
- [Emergency symptoms to watch for]

### Lifestyle & Diet Recommendations
- [2 relevant diet/lifestyle suggestions]

Keep the whole response under 450 words.
End with: *"This is an AI-assisted clinical insight and must be validated by a licensed healthcare professional before any clinical decision."*`;
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

  let sourceUsed = '';
  let finalResult = null;

  try {
    const { text, confidence, source } = await firstSuccessfulProvider(buildPrompt(payload));
    sourceUsed = source;
    finalResult = { text, confidence };
  } catch (error) {
    return { ...fallbackDiagnosis(payload.symptoms), cached: false, error: error.message };
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

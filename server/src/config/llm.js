const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');

let _gemini = null;
let _groq = null;

function getProvider() {
  if (process.env.GEMINI_API_KEY) return 'gemini';
  if (process.env.GROQ_API_KEY) return 'groq';
  throw new Error('No hay API key configurada (GEMINI_API_KEY o GROQ_API_KEY)');
}

function getGeminiModel() {
  if (!_gemini) {
    _gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return _gemini.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

function getGroqClient() {
  if (!_groq) {
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
}

const GROQ_MODEL = process.env.LLM_MODEL || 'llama-3.3-70b-versatile';

module.exports = { getProvider, getGeminiModel, getGroqClient, GROQ_MODEL };

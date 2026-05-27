const Groq = require('groq-sdk');

let _client = null;

function getClient() {
  if (!_client) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY no está configurada en .env');
    _client = new Groq({ apiKey });
  }
  return _client;
}

const MODEL = process.env.LLM_MODEL || 'llama-3.3-70b-versatile';

module.exports = { getClient, MODEL };

import express from 'express';
import OpenAI from 'openai';
import config from '../config/environment.js';

const router = express.Router();

// Initialize OpenAI with API key from config
const openai = new OpenAI({ 
  apiKey: config.openai.apiKey 
});

// Validate OpenAI API key
if (!config.openai.apiKey) {
  console.error('OpenAI API key is not configured. AI features will not work.');
}

router.post('/chat', async (req, res) => {
  const { message } = req.body;
  
  // Validate input
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ 
      error: 'Invalid input', 
      details: 'Message is required and must be a string' 
    });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'system', 
          content: 'You are a helpful AI assistant for a hotel management system. Provide helpful, professional responses about hotel services, bookings, and general hospitality questions.' 
        },
        { role: 'user', content: message }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    res.json({ 
      reply: completion.choices[0].message.content,
      usage: completion.usage 
    });
  } catch (err) {
    console.error('OpenAI API Error:', err);
    
    if (err.code === 'insufficient_quota') {
      return res.status(429).json({ 
        error: 'API quota exceeded', 
        details: 'Please check your OpenAI account billing' 
      });
    }
    
    if (err.code === 'invalid_api_key') {
      return res.status(401).json({ 
        error: 'Invalid API key', 
        details: 'Please check your OpenAI API key configuration' 
      });
    }

    res.status(500).json({ 
      error: 'AI service error', 
      details: err.message 
    });
  }
});

// Health check endpoint for AI service
router.get('/health', async (req, res) => {
  try {
    if (!config.openai.apiKey) {
      return res.status(503).json({ 
        status: 'unavailable', 
        message: 'OpenAI API key not configured' 
      });
    }
    
    res.json({ 
      status: 'healthy', 
      message: 'AI service is ready',
      hasApiKey: !!config.openai.apiKey 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

export default router;
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Auth middleware
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Auth endpoints
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Email, password, and username are required' });
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { username },
      email_confirm: false
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ user: data.user });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ user: data.user, session: data.session });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Tavus API endpoints
app.post('/api/tavus/conversation', authenticateUser, async (req, res) => {
  try {
    const { personaId, replicaId, name } = req.body;

    if (!personaId) {
      return res.status(400).json({ error: 'Persona ID is required' });
    }

    // Build the context string
    let contextString = "";
    if (name && name.trim() !== '') {
      contextString = `You are talking with the user, ${name}. `;
    }
    contextString += `You are an AI persona for dating practice conversations. Be friendly, engaging, and help the user practice their dating conversation skills.`;

    const payload = {
      persona_id: personaId,
      custom_greeting: "Hey there! I'm excited to chat with you today. How are you doing?",
      conversational_context: contextString.trim()
    };

    // Add replica_id only if provided
    if (replicaId && replicaId.trim() !== '') {
      payload.replica_id = replicaId;
    }

    console.log('Creating conversation with payload:', payload);

    const response = await fetch("https://tavusapi.com/v2/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.TAVUS_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log('Tavus API response:', response.status, responseText);

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Tavus API error: ${responseText}` 
      });
    }

    const data = JSON.parse(responseText);
    res.json(data);
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

app.post('/api/tavus/conversation/:id/end', authenticateUser, async (req, res) => {
  try {
    const { id: conversationId } = req.params;

    if (!conversationId) {
      return res.status(400).json({ error: 'Conversation ID is required' });
    }

    const response = await fetch(
      `https://tavusapi.com/v2/conversations/${conversationId}/end`,
      {
        method: "POST",
        headers: {
          "x-api-key": process.env.TAVUS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ 
        error: `Tavus API error: ${errorText}` 
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('End conversation error:', error);
    res.status(500).json({ error: 'Failed to end conversation' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
});
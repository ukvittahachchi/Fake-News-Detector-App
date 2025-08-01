require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { HfInference } = require('@huggingface/inference');

// Import rule detectors
const clickbaitDetector = require('./rules/clickbait');
const biasDetector = require('./rules/bias');
const credibilityDetector = require('./rules/credibility');
const mlDetector = require('./rules/mlRules');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3001;
const hf = new HfInference(process.env.HF_API_TOKEN);

// Enhanced rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 50 : 100, // Lower limit in prod
  message: {
    error: 'Too many requests',
    message: 'Please try again after 15 minutes'
  },
  validate: { trustProxy: false }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"]
    }
  },
  crossOriginResourcePolicy: { policy: "same-site" }
}));

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '500kb' })); // Prevent large payloads

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV
  });
});

// API Documentation
app.get('/api/docs', (req, res) => {
  res.json({
    endpoints: {
      '/api/analyze': {
        method: 'POST',
        description: 'Analyze text for fake news indicators',
        parameters: {
          text: 'String (required)',
          metadata: 'Object (optional)'
        },
        rateLimit: '100 requests/15 minutes'
      }
    }
  });
});

// Main analysis endpoint
app.post('/api/analyze', apiLimiter, async (req, res) => {
  const { text, metadata = {} } = req.body;
  
  // Input validation
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ 
      error: 'Invalid input',
      details: 'Text content must be a non-empty string'
    });
  }

  if (text.length > 5000) {
    return res.status(413).json({
      error: 'Payload too large',
      details: 'Text must be under 5000 characters'
    });
  }

  try {
    // Parallel detection execution with timeout
    const analysisPromise = Promise.all([
      clickbaitDetector.detect(text),
      biasDetector.detect(text),
      credibilityDetector.detect(text, metadata),
      mlDetector.detect(text)
    ]);

    // Set 10-second timeout for analysis
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Analysis timeout')), 10000)
    );

    const [clickbait, bias, credibility, ml] = await Promise.race([
      analysisPromise,
      timeoutPromise
    ]);

    // Calculate composite score with weights
    const compositeScore = calculateCompositeScore(
      clickbait.score, 
      bias.score, 
      credibility.score, 
      ml.score
    );

    // Compile and sort issues by severity
    const allIssues = compileIssues(
      clickbait.issues,
      bias.issues,
      credibility.issues,
      ml.issues
    );

    // Prepare response
    const response = {
      verdict: getVerdict(compositeScore),
      score: Math.round(compositeScore),
      details: { clickbait, bias, credibility, ml },
      issues: allIssues,
      suggestedActions: getSuggestedActions(allIssues),
      modelUsed: process.env.HF_MODEL || 'facebook/bart-large-mnli',
      analyzedAt: new Date().toISOString()
    };

    // Cache control headers
    res.set('Cache-Control', 'public, max-age=300');
    res.json(response);

  } catch (error) {
    console.error(`Analysis Error: ${error.message}`);
    
    const statusCode = error.message.includes('timeout') ? 504 : 500;
    res.status(statusCode).json({
      error: 'Analysis failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      fallbackAnalysis: statusCode === 504 ? await runFallbackAnalysis(text) : null
    });
  }
});

// Helper functions
function calculateCompositeScore(clickbait, bias, credibility, ml) {
  const weights = {
    clickbait: 0.3,
    bias: 0.25,
    credibility: 0.25,
    ml: 0.2
  };
  
  return Math.min(100,
    (clickbait * weights.clickbait) +
    (bias * weights.bias) +
    (credibility * weights.credibility) +
    (ml * weights.ml)
  );
}

function compileIssues(...issueArrays) {
  return issueArrays
    .flat()
    .sort((a, b) => {
      const severityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
}

function getVerdict(score) {
  if (score >= 75) return 'highly suspicious';
  if (score >= 50) return 'suspicious';
  if (score >= 25) return 'possibly misleading';
  return 'likely credible';
}

function getSuggestedActions(issues) {
  const actions = new Set();
  
  if (issues.some(i => i.severity === 'critical')) {
    actions.add('Verify with fact-checking websites like Snopes or FactCheck.org');
  }
  
  if (issues.some(i => i.type.includes('clickbait'))) {
    actions.add('Be cautious of emotionally charged or exaggerated language');
  }
  
  if (issues.some(i => i.type.includes('bias'))) {
    actions.add('Compare with neutral reporting from sources like Reuters or AP News');
  }
  
  if (issues.some(i => i.type.includes('ai_generated'))) {
    actions.add('This content may be AI-generated - check original sources');
  }
  
  return Array.from(actions);
}

async function runFallbackAnalysis(text) {
  console.log('Running fallback analysis');
  try {
    const clickbait = await clickbaitDetector.detect(text);
    const bias = await biasDetector.detect(text);
    return {
      verdict: getVerdict((clickbait.score + bias.score) / 2),
      score: Math.round((clickbait.score + bias.score) / 2),
      issues: [...clickbait.issues, ...bias.issues],
      note: 'Fallback analysis (ML service unavailable)'
    };
  } catch (fallbackError) {
    console.error('Fallback analysis failed:', fallbackError);
    return null;
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Unhandled Error: ${err.stack}`);
  res.status(500).json({
    error: 'Internal server error',
    requestId: req.id
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`
  ███████╗ █████╗ ██╗  ██╗███████╗    ███╗   ██╗███████╗██╗    ██╗███████╗
  ██╔════╝██╔══██╗██║ ██╔╝██╔════╝    ████╗  ██║██╔════╝██║    ██║██╔════╝
  █████╗  ███████║█████╔╝ █████╗      ██╔██╗ ██║█████╗  ██║ █╗ ██║███████╗
  ██╔══╝  ██╔══██║██╔═██╗ ██╔══╝      ██║╚██╗██║██╔══╝  ██║███╗██║╚════██║
  ██║     ██║  ██║██║  ██╗███████╗    ██║ ╚████║███████╗╚███╔███╔╝███████║
  ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝    ╚═╝  ╚═══╝╚══════╝ ╚══╝╚══╝ ╚══════╝
  `);
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`API Docs: http://localhost:${PORT}/api/docs`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server terminated');
    process.exit(0);
  });
});

module.exports = server; // For testing
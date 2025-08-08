require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');
const { HfInference } = require('@huggingface/inference');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Import rule detectors
const clickbaitDetector = require('./rules/clickbait');
const biasDetector = require('./rules/bias');
const credibilityDetector = require('./rules/credibility');
const mlDetector = require('./rules/mlRules');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3001;
const hf = new HfInference(process.env.HF_API_TOKEN);

// Severity order for sorting
const severityOrder = { critical: 3, high: 2, medium: 1, low: 0 };

// Enhanced rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 50 : 100,
  message: {
    error: 'Too many requests',
    message: 'Please try again after 15 minutes'
  },
  validate: { trustProxy: false },
  keyGenerator: (req) => req.id
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
app.use(bodyParser.json({ limit: '500kb' }));

// Request ID and logging middleware
app.use((req, res, next) => {
  req.id = uuidv4();
  logger.info(`${req.method} ${req.path}`, { requestId: req.id });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV,
    requestId: req.id
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
    },
    requestId: req.id
  });
});

// Text sanitization helper
const sanitizeInput = (text) => {
  return text.trim()
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .replace(/\s{2,}/g, ' '); // Collapse multiple spaces
};

// Main analysis endpoint
app.post('/api/analyze', apiLimiter, async (req, res) => {
  const { text, metadata = {} } = req.body;
  
  // Input validation and sanitization
  if (!text || typeof text !== 'string') {
    logger.warn('Invalid input type', { requestId: req.id });
    return res.status(400).json({ 
      error: 'Invalid input',
      details: 'Text content must be a non-empty string',
      requestId: req.id
    });
  }

  // Validate metadata if provided
  if (metadata && typeof metadata !== 'object') {
    logger.warn('Invalid metadata type', { requestId: req.id });
    return res.status(400).json({ 
      error: 'Invalid metadata',
      details: 'Metadata must be an object',
      requestId: req.id
    });
  }

  const sanitizedText = sanitizeInput(text);
  if (sanitizedText.length === 0) {
    logger.warn('Empty text after sanitization', { requestId: req.id });
    return res.status(400).json({ 
      error: 'Invalid input', 
      details: 'Text contains no valid content after sanitization',
      requestId: req.id
    });
  }

  if (sanitizedText.length > 5000) {
    logger.warn('Payload too large', { requestId: req.id, length: sanitizedText.length });
    return res.status(413).json({
      error: 'Payload too large',
      details: 'Text must be under 5000 characters',
      requestId: req.id
    });
  }

  try {
    // Parallel detection with individual timeouts
    const analysisPromise = Promise.all([
      clickbaitDetector.detect(sanitizedText),
      biasDetector.detect(sanitizedText),
      credibilityDetector.detect(sanitizedText, metadata),
      mlDetector.detect(sanitizedText).catch(err => {
        logger.error('ML detection failed', { error: err.message, requestId: req.id });
        return {
          rule: 'ml',
          score: 0,
          issues: [],
          error: 'ML service unavailable'
        };
      })
    ]);

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => {
        logger.warn('Analysis timeout', { requestId: req.id });
        reject(new Error('Analysis timeout'));
      }, 10000)
    );

    const [clickbait, bias, credibility, ml] = await Promise.race([
      analysisPromise,
      timeoutPromise
    ]);

    // Calculate composite score
    const compositeScore = Math.min(100,
      (clickbait.score * 0.3) +
      (bias.score * 0.25) +
      (credibility.score * 0.25) +
      (ml.score * 0.2)
    );

    // Prepare response
    const response = {
      verdict: getVerdict(compositeScore),
      score: Math.round(compositeScore),
      details: { clickbait, bias, credibility, ml },
      issues: [...clickbait.issues, ...bias.issues, ...credibility.issues, ...ml.issues]
        .filter(issue => issue) // Filter out any undefined issues
        .sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]),
      suggestedActions: getSuggestedActions([...clickbait.issues, ...bias.issues, ...credibility.issues, ...ml.issues]),
      modelUsed: ml.modelUsed || process.env.HF_MODEL || 'facebook/bart-large-mnli',
      analyzedAt: new Date().toISOString(),
      requestId: req.id
    };

    logger.info('Analysis completed', { 
      requestId: req.id, 
      score: response.score,
      verdict: response.verdict
    });

    res.set('Cache-Control', 'public, max-age=300');
    res.json(response);

  } catch (error) {
    logger.error('Analysis failed', { 
      error: error.message, 
      stack: error.stack,
      requestId: req.id
    });

    if (error.message.includes('timeout')) {
      const fallback = await runFallbackAnalysis(sanitizedText);
      res.status(504).json({
        error: 'Analysis timeout',
        details: 'Using fallback analysis without ML',
        fallbackAnalysis: fallback,
        requestId: req.id
      });
    } else {
      res.status(500).json({
        error: 'Analysis failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        requestId: req.id
      });
    }
  }
});

// Helper functions
function getVerdict(score) {
  if (score >= 75) return 'highly suspicious';
  if (score >= 50) return 'suspicious';
  if (score >= 25) return 'possibly misleading';
  return 'likely credible';
}

function getSuggestedActions(issues) {
  const actions = new Set();
  
  if (issues.some(i => i?.severity === 'critical')) {
    actions.add('Verify with fact-checking websites like Snopes or FactCheck.org');
  }
  
  if (issues.some(i => i?.type?.includes('clickbait'))) {
    actions.add('Be cautious of emotionally charged or exaggerated language');
  }
  
  if (issues.some(i => i?.type?.includes('bias'))) {
    actions.add('Compare with neutral reporting from sources like Reuters or AP News');
  }
  
  if (issues.some(i => i?.type?.includes('ai_generated'))) {
    actions.add('This content may be AI-generated - check original sources');
  }
  
  return Array.from(actions);
}

async function runFallbackAnalysis(text) {
  try {
    logger.info('Running fallback analysis');
    const [clickbait, bias] = await Promise.all([
      clickbaitDetector.detect(text),
      biasDetector.detect(text)
    ]);
    
    return {
      verdict: getVerdict((clickbait.score + bias.score) / 2),
      score: Math.round((clickbait.score + bias.score) / 2),
      issues: [...(clickbait.issues || []), ...(bias.issues || [])],
      note: 'Fallback analysis (ML service unavailable)'
    };
  } catch (error) {
    logger.error('Fallback analysis failed', { error: error.message });
    return {
      verdict: 'analysis failed',
      score: 0,
      issues: [],
      note: 'Could not perform any analysis'
    };
  }
}

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`, {
    environment: process.env.NODE_ENV || 'development'
  });
});

// Graceful shutdown
const shutdown = (signal) => {
  logger.info(`${signal} received - shutting down`);
  server.close(() => {
    logger.info('Server terminated');
    process.exit(0);
  });

  // Force close after 5 seconds
  setTimeout(() => {
    logger.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 5000);
};

['SIGTERM', 'SIGINT'].forEach(signal => {
  process.on(signal, () => shutdown(signal));
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled rejection', { error: err.message, stack: err.stack });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { error: err.message, stack: err.stack });
  shutdown('uncaughtException');
});

module.exports = server;
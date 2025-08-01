const CLICKBAIT_PHRASES = [
  'you won\'t believe', 'shocking', 'mind-blowing', 
  'what happened next', 'this will change everything',
  'doctors hate this', 'secret they don\'t want you to know',
  'instant results', 'miracle cure', 'gone viral'
];

const EXCLAMATION_THRESHOLD = 3;

module.exports = {
  detect: (text) => {
    const issues = [];
    const lowerText = text.toLowerCase();

    // Check for clickbait phrases
    CLICKBAIT_PHRASES.forEach(phrase => {
      if (lowerText.includes(phrase)) {
        issues.push({
          type: 'clickbait_phrase',
          match: phrase,
          severity: 'high'
        });
      }
    });

    // Check for excessive exclamations
    const exclamations = (text.match(/!/g) || []).length;
    if (exclamations > EXCLAMATION_THRESHOLD) {
      issues.push({
        type: 'excessive_exclamations',
        count: exclamations,
        severity: 'medium'
      });
    }

    return {
      rule: 'clickbait',
      score: Math.min(100, issues.length * 20),
      issues
    };
  }
};
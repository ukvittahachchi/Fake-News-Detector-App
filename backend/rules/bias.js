const BIAS_INDICATORS = {
  political: [
    'radical left', 'right-wing extremist', 'libtard', 'snowflake',
    'woke agenda', 'socialist takeover'
  ],
  emotional: [
    'disgusting', 'horrific', 'outrageous', 'appalling',
    'treasonous', 'unforgivable'
  ],
  sensational: [
    'massive cover-up', 'secret plot', 'they don\'t want you to know',
    'hidden truth'
  ]
};

module.exports = {
  detect: (text) => {
    const issues = [];
    const lowerText = text.toLowerCase();

    Object.entries(BIAS_INDICATORS).forEach(([type, phrases]) => {
      phrases.forEach(phrase => {
        if (lowerText.includes(phrase)) {
          issues.push({
            type: `${type}_bias`,
            match: phrase,
            severity: type === 'political' ? 'high' : 'medium'
          });
        }
      });
    });

    return {
      rule: 'bias',
      score: Math.min(100, issues.length * 15),
      issues
    };
  }
};
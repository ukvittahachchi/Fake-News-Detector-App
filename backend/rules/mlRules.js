const { analyzeWithML } = require('../services/mlService');

module.exports = {
  detect: async (text) => {
    const defaultResponse = {
      rule: 'ml',
      score: 50, // Changed from 0 to neutral 50
      issues: [],
      note: 'ML analysis using fallback'
    };

    try {
      const mlResults = await analyzeWithML(text);
      
      if (!mlResults?.classification?.labels || !mlResults?.classification?.scores) {
        return defaultResponse;
      }

      const { labels, scores } = mlResults.classification;
      const issues = [];
      let mlScore = 0;

      if (labels.length === scores.length && labels.length > 0) {
        labels.forEach((label, index) => {
          const score = scores[index];
          if (score > 0.3) { // Lowered threshold from 0.5 to 0.3
            issues.push({
              type: `ml_${label.replace(/\s+/g, '_')}`,
              score: Math.round(score * 100),
              severity: score > 0.6 ? 'high' : 'medium' // Adjusted thresholds
            });
            mlScore += score * 100;
          }
        });
      }

      return {
        ...defaultResponse,
        score: issues.length ? Math.min(100, mlScore / issues.length) : 50,
        issues,
        modelUsed: mlResults.modelUsed
      };

    } catch (error) {
      console.error('ML detection failed:', error);
      return defaultResponse;
    }
  }
};
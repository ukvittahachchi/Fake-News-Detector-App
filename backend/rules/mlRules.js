const { analyzeWithML } = require('../services/mlService');

module.exports = {
  detect: async (text) => {
    const mlResults = await analyzeWithML(text);
    if (!mlResults) return { rule: 'ml', score: 0, issues: [] };

    const { classification, aiDetection } = mlResults;
    const issues = [];
    let mlScore = 0;

    // Process classification results
    classification.labels.forEach((label, index) => {
      const score = classification.scores[index];
      if (score > 0.7) {
        issues.push({
          type: `ml_${label.replace(' ', '_')}`,
          score: Math.round(score * 100),
          severity: score > 0.85 ? 'critical' : 'high'
        });
        mlScore += score * 100;
      }
    });

    // Process AI detection
    if (aiDetection.label === 'Fake' && aiDetection.score > 0.8) {
      issues.push({
        type: 'ai_generated_content',
        score: Math.round(aiDetection.score * 100),
        severity: 'critical'
      });
      mlScore += aiDetection.score * 100;
    }

    return {
      rule: 'ml',
      score: Math.min(100, mlScore / 2), // Normalize score
      issues,
      rawResults: mlResults // For debugging
    };
  }
};
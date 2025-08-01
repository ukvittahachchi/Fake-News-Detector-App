const CREDIBLE_SOURCES = [
  'reuters.com', 'apnews.com', 'bbc.co.uk', 
  'npr.org', 'theguardian.com'
];

const QUESTIONABLE_SOURCES = [
  'infowars.com', 'naturalnews.com',
  'beforeitsnews.com', 'worldtruth.tv'
];

module.exports = {
  detect: (text, metadata = {}) => {
    const issues = [];
    let sourceScore = 0;

    // Check if URL was provided
    if (metadata.url) {
      const domain = new URL(metadata.url).hostname;
      
      if (QUESTIONABLE_SOURCES.some(src => domain.includes(src))) {
        issues.push({
          type: 'questionable_source',
          source: domain,
          severity: 'critical'
        });
        sourceScore = 80;
      }
      else if (CREDIBLE_SOURCES.some(src => domain.includes(src))) {
        sourceScore = -20; // Negative score improves credibility
      }
    }

    // Check for attribution
    const hasAttribution = /(according to|said by|reported by|as per) [A-Z][a-z]+/.test(text);
    if (!hasAttribution) {
      issues.push({
        type: 'missing_attribution',
        severity: 'medium'
      });
      sourceScore += 15;
    }

    return {
      rule: 'credibility',
      score: Math.max(0, sourceScore),
      issues
    };
  }
};
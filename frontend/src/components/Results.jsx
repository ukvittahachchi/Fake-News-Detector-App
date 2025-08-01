import { 
  FiAlertTriangle, 
  FiCheckCircle,
  FiInfo,
  FiExternalLink,
  FiClock,
  FiCopy,
  FiBarChart2,
  FiShield
} from 'react-icons/fi';

const SEVERITY_COLORS = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-blue-100 text-blue-800 border-blue-200'
};

const VERDICT_COLORS = {
  'highly suspicious': 'bg-red-100 text-red-800 border-red-200',
  'suspicious': 'bg-orange-100 text-orange-800 border-orange-200',
  'possibly misleading': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'likely credible': 'bg-green-100 text-green-800 border-green-200'
};

export default function Results({ data, onReset, onViewHistory }) {
  if (!data) return null;

  const copyResults = () => {
    const resultText = `Fake News Detection Results:
Verdict: ${data.verdict}
Score: ${data.score}/100
Issues Found: ${data.issues.length}
${data.issues.map(i => `- ${i.type.replace(/_/g, ' ')} (${i.severity})`).join('\n')}
Analyzed at: ${new Date(data.analyzedAt).toLocaleString()}`;
    
    navigator.clipboard.writeText(resultText);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {/* Verdict Banner */}
      <div className={`p-4 rounded-lg border ${VERDICT_COLORS[data.verdict]} flex items-start shadow-sm`}>
        {data.score >= 70 ? (
          <FiAlertTriangle className="mt-1 mr-3 flex-shrink-0" size={24} />
        ) : (
          <FiCheckCircle className="mt-1 mr-3 flex-shrink-0" size={24} />
        )}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">Verdict: {data.verdict}</h2>
              <p className="text-sm">Confidence score: {data.score}/100</p>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={copyResults}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="Copy results"
              >
                <FiCopy size={18} />
              </button>
            </div>
          </div>
          
          {/* Score Meter */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${
                  data.score >= 70 ? 'bg-red-500' :
                  data.score >= 50 ? 'bg-orange-500' :
                  data.score >= 25 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${data.score}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Credible</span>
              <span>Suspicious</span>
            </div>
          </div>
        </div>
      </div>

      {/* Issues Breakdown */}
      <div className="bg-white p-5 rounded-lg shadow-md border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FiBarChart2 className="mr-2" /> Detailed Analysis
        </h3>
        
        {data.issues.length > 0 ? (
          <div className="space-y-3">
            {data.issues.map((issue, i) => (
              <div 
                key={i} 
                className={`p-3 rounded-md border ${SEVERITY_COLORS[issue.severity] || 'bg-gray-50'} transition-all hover:shadow-sm`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium capitalize">
                      {issue.type.replace(/_/g, ' ')}
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-white bg-opacity-70">
                        {issue.severity}
                      </span>
                    </div>
                    {issue.match && (
                      <div className="text-sm mt-1 text-gray-600">
                        Detected: <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                          {issue.match.length > 50 ? `${issue.match.substring(0, 50)}...` : issue.match}
                        </span>
                      </div>
                    )}
                  </div>
                  {issue.score && (
                    <span className="text-xs font-mono bg-white px-2 py-1 rounded-full shadow-inner">
                      {issue.score}%
                    </span>
                  )}
                </div>
                {issue.type.includes('ml_') && (
                  <div className="mt-2 text-xs text-gray-500 flex items-center">
                    <FiShield className="mr-1" /> Detected by AI model
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <FiCheckCircle size={32} className="mx-auto text-green-500 mb-2" />
            <p>No significant issues detected</p>
          </div>
        )}
      </div>

      {/* ML Insights */}
      {data.details?.ml?.issues?.length > 0 && (
        <div className="bg-purple-50 p-5 rounded-lg border border-purple-200">
          <h3 className="text-lg font-semibold mb-3 text-purple-800 flex items-center">
            <FiShield className="mr-2" /> AI Detection Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.details.ml.issues.map((issue, i) => (
              <div key={i} className="bg-white p-3 rounded border border-purple-100">
                <div className="flex justify-between">
                  <span className="font-medium capitalize text-purple-700">
                    {issue.type.replace(/ml_|ai_/g, '').replace(/_/g, ' ')}
                  </span>
                  <span className="font-mono text-sm bg-purple-100 text-purple-800 px-2 rounded-full">
                    {issue.score}%
                  </span>
                </div>
                {issue.type.includes('generated') && (
                  <p className="text-xs mt-1 text-purple-600">
                    This content shows signs of being AI-generated
                  </p>
                )}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-purple-600 text-center">
            Model: {data.modelUsed || 'facebook/bart-large-mnli'}
          </p>
        </div>
      )}

      {/* Recommended Actions */}
      {data.suggestedActions?.length > 0 && (
        <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold mb-3 text-blue-800">Recommended Actions</h3>
          <ul className="space-y-2">
            {data.suggestedActions.map((action, i) => (
              <li key={i} className="flex items-start">
                <span className="flex-shrink-0 mt-1 mr-2 text-blue-500">•</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-3 justify-center">
            <a 
              href={`https://www.google.com/search?q=${encodeURIComponent(data.sampleText || '')}+site:snopes.com`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 border border-blue-200 bg-white text-blue-600 rounded-full text-sm hover:bg-blue-50 transition-colors"
            >
              Check on Snopes <FiExternalLink className="ml-1" />
            </a>
            <a 
              href={`https://toolbox.google.com/factcheck/explorer/search/${encodeURIComponent(data.sampleText?.split(' ').slice(0, 5).join(' ') || '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 border border-blue-200 bg-white text-blue-600 rounded-full text-sm hover:bg-blue-50 transition-colors"
            >
              Google Fact Check <FiExternalLink className="ml-1" />
            </a>
            <a 
              href="https://mediabiasfactcheck.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 border border-blue-200 bg-white text-blue-600 rounded-full text-sm hover:bg-blue-50 transition-colors"
            >
              Media Bias Check <FiExternalLink className="ml-1" />
            </a>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={onReset}
          className="flex-1 py-2.5 px-4 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors flex items-center justify-center"
        >
          Analyze Another Article
        </button>
        <button
          onClick={onViewHistory}
          className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center"
        >
          <FiClock className="mr-2" /> View History
        </button>
      </div>

      {/* Timestamp */}
      <div className="text-center text-xs text-gray-400 mt-4">
        Analyzed at: {new Date(data.analyzedAt).toLocaleString()}
      </div>
    </div>
  );
}
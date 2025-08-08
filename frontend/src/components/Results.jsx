import { 
  FiAlertTriangle, 
  FiCheckCircle,
  FiInfo,
  FiExternalLink,
  FiClock,
  FiCopy,
  FiBarChart2,
  FiShield,
  FiChevronRight
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const SEVERITY_COLORS = {
  critical: 'from-red-500 to-red-600',
  high: 'from-orange-500 to-orange-600',
  medium: 'from-amber-500 to-amber-600',
  low: 'from-blue-500 to-blue-600'
};

const VERDICT_COLORS = {
  'highly suspicious': 'from-red-500 to-pink-600',
  'suspicious': 'from-orange-500 to-amber-600',
  'possibly misleading': 'from-amber-500 to-yellow-500',
  'likely credible': 'from-emerald-500 to-teal-500'
};

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 }
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
    <motion.div 
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: 0.1 }}
      className="max-w-4xl mx-auto p-6 space-y-8"
    >
      {/* Verdict Card */}
      <motion.div 
        variants={scaleUp}
        className={`relative p-6 rounded-2xl bg-gradient-to-br ${VERDICT_COLORS[data.verdict]} text-white shadow-xl overflow-hidden`}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center mb-2">
                <h2 className="text-2xl font-bold mr-3">Content Analysis</h2>
                <span className="text-xs font-medium bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
                  {data.modelUsed || 'AI-Powered'}
                </span>
              </div>
              <p className="text-white/90">Final Verdict:</p>
              <h3 className="text-3xl font-bold mt-1 capitalize">{data.verdict}</h3>
            </div>
            <button 
              onClick={copyResults}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              title="Copy results"
            >
              <FiCopy size={18} className="text-white" />
            </button>
          </div>
          
          {/* Score Meter */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Confidence Score</span>
              <span className="text-lg font-bold">{data.score}/100</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-full bg-white`}
                style={{ width: `${data.score}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs mt-2 text-white/80">
              <span>Credible</span>
              <span>Questionable</span>
              <span>Suspicious</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Issues Breakdown */}
      <motion.div variants={fadeIn} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100/50">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold flex items-center">
            <FiBarChart2 className="mr-3 text-indigo-500" /> Detailed Analysis
          </h3>
          <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
            {data.issues.length} {data.issues.length === 1 ? 'issue' : 'issues'} detected
          </span>
        </div>
        
        {data.issues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.issues.map((issue, i) => (
              <motion.div 
                key={i}
                variants={fadeIn}
                whileHover={{ y: -5 }}
                className={`p-4 rounded-xl border border-gray-100 bg-white shadow-xs hover:shadow-sm transition-all relative overflow-hidden group`}
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${SEVERITY_COLORS[issue.severity]}"></div>
                
                <div className="flex justify-between items-start ml-3">
                  <div>
                    <div className="font-medium flex items-center capitalize">
                      <span className={`w-3 h-3 rounded-full mr-3 bg-gradient-to-br ${SEVERITY_COLORS[issue.severity]}`}></span>
                      {issue.type.replace(/_/g, ' ')}
                    </div>
                    {issue.match && (
                      <div className="text-sm mt-3 text-gray-600">
                        <div className="font-medium text-xs text-gray-500 mb-1">Detected Pattern</div>
                        <div className="font-mono bg-gray-50 px-3 py-2 rounded-lg inline-block">
                          {issue.match.length > 50 ? `${issue.match.substring(0, 50)}...` : issue.match}
                        </div>
                      </div>
                    )}
                  </div>
                  {issue.score && (
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      issue.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      issue.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      issue.severity === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {issue.score}%
                    </span>
                  )}
                </div>
                {issue.type.includes('ml_') && (
                  <div className="mt-3 text-xs text-gray-500 flex items-center ml-6">
                    <FiShield className="mr-2" /> AI-detected pattern
                  </div>
                )}
                
                <div className="absolute bottom-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiChevronRight className="text-gray-400" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
              <FiCheckCircle size={32} className="text-emerald-500" />
            </div>
            <p className="text-lg font-medium text-gray-800">No significant issues detected</p>
            <p className="text-gray-500 mt-1">The content appears to be credible</p>
          </div>
        )}
      </motion.div>

      {/* ML Insights */}
      {data.details?.ml?.issues?.length > 0 && (
        <motion.div variants={fadeIn} className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 shadow-sm">
          <div className="flex items-center mb-5">
            <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg mr-4">
              <FiShield size={20} className="text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-indigo-800">AI Detection Insights</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.details.ml.issues.map((issue, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.03 }}
                className="bg-white p-4 rounded-xl border border-indigo-100 shadow-xs hover:shadow-sm transition-all"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-indigo-700 capitalize">
                    {issue.type.replace(/ml_|ai_/g, '').replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs font-bold bg-indigo-600 text-white px-2 py-1 rounded-full">
                    {issue.score}%
                  </span>
                </div>
                
                {issue.explanation && (
                  <p className="text-xs text-gray-600 mt-2">
                    {issue.explanation}
                  </p>
                )}
                
                {issue.type.includes('generated') && (
                  <div className="mt-3 pt-3 border-t border-indigo-50 flex items-center">
                    <span className="text-xs text-indigo-500 font-medium">AI-Generated Content</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recommended Actions */}
      {data.suggestedActions?.length > 0 && (
        <motion.div variants={fadeIn} className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-100 shadow-sm">
          <div className="flex items-center mb-5">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mr-4">
              <FiInfo size={20} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-blue-800">Recommended Actions</h3>
          </div>
          
          <ul className="space-y-3">
            {data.suggestedActions.map((action, i) => (
              <motion.li 
                key={i}
                whileHover={{ x: 5 }}
                className="flex items-start bg-white/50 p-3 rounded-lg border border-blue-100 backdrop-blur-sm"
              >
                <span className="flex-shrink-0 mt-1 mr-3 text-blue-500">
                  <FiChevronRight size={14} />
                </span>
                <span className="text-sm">{action}</span>
              </motion.li>
            ))}
          </ul>
          
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <motion.a 
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              href={`https://www.google.com/search?q=${encodeURIComponent(data.sampleText || '')}+site:snopes.com`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 py-2.5 border border-blue-200 bg-white text-blue-600 rounded-lg text-sm hover:bg-blue-50 transition-all shadow-xs"
            >
              <FiExternalLink className="mr-2" /> Snopes
            </motion.a>
            <motion.a 
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              href={`https://toolbox.google.com/factcheck/explorer/search/${encodeURIComponent(data.sampleText?.split(' ').slice(0, 5).join(' ') || '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 py-2.5 border border-blue-200 bg-white text-blue-600 rounded-lg text-sm hover:bg-blue-50 transition-all shadow-xs"
            >
              <FiExternalLink className="mr-2" /> Fact Check
            </motion.a>
            <motion.a 
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              href="https://mediabiasfactcheck.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 py-2.5 border border-blue-200 bg-white text-blue-600 rounded-lg text-sm hover:bg-blue-50 transition-all shadow-xs"
            >
              <FiExternalLink className="mr-2" /> Bias Check
            </motion.a>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div variants={fadeIn} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onReset}
          className="py-3.5 px-6 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white rounded-xl transition-all shadow-md flex items-center justify-center"
        >
          Analyze Another Article
        </motion.button>
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onViewHistory}
          className="py-3.5 px-6 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all shadow-sm flex items-center justify-center"
        >
          <FiClock className="mr-3" /> View History
        </motion.button>
      </motion.div>

      {/* Timestamp */}
      <motion.div variants={fadeIn} className="text-center text-sm text-gray-400 mt-6">
        <div className="inline-flex items-center bg-gray-50 px-4 py-2 rounded-full">
          <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></span>
          Analyzed at: {new Date(data.analyzedAt).toLocaleString()}
        </div>
      </motion.div>
    </motion.div>
  );
}
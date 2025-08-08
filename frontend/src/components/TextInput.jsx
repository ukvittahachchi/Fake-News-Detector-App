import { useState, useEffect, useRef } from 'react';
import { FiSend, FiCopy, FiTrash2, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function TextInput({ onAnalyze, isLoading }) {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  const wordCount = text.split(/\s+/).filter(Boolean).length;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Fake News Detector
        </h1>
        <p className="text-gray-500/80">Analyze news articles for potential misinformation using AI</p>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <div className={`relative bg-white rounded-xl border-2 ${isFocused ? 'border-blue-400/50 ring-4 ring-blue-100/30' : 'border-gray-200'} 
                        transition-all duration-300 overflow-hidden shadow-lg hover:shadow-xl backdrop-blur-sm`}
             style={{
               background: 'linear-gradient(to bottom, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)'
             }}>
          <textarea
            ref={textareaRef}
            className="w-full min-h-[220px] p-6 bg-transparent focus:outline-none resize-none placeholder:text-gray-400/60 text-gray-700 text-lg"
            placeholder="Paste news article text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={isLoading}
          />
          
          <AnimatePresence>
            {text && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-4 right-4 flex space-x-2 bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-sm border border-gray-200/70"
              >
                {!isLoading && (
                  <>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50/50 rounded-lg transition-all"
                      onClick={() => navigator.clipboard.writeText(text)}
                      title="Copy text"
                    >
                      <FiCopy size={18} />
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50/50 rounded-lg transition-all"
                      onClick={() => setText('')}
                      title="Clear text"
                    >
                      <FiTrash2 size={18} />
                    </motion.button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <motion.div 
        className="flex flex-col sm:flex-row justify-between items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <AnimatePresence>
          {text.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center px-4 py-2 bg-blue-50/80 text-blue-600 rounded-full border border-blue-200/50 backdrop-blur-sm"
            >
              <FiAlertCircle className="mr-2 text-blue-400" size={16} />
              <span className="font-medium">{wordCount} {wordCount === 1 ? 'word' : 'words'} to analyze</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.button
          whileHover={(!text || isLoading) ? {} : { scale: 1.03 }}
          whileTap={(!text || isLoading) ? {} : { scale: 0.98 }}
          onClick={() => onAnalyze(text)}
          disabled={!text || isLoading}
          className={`relative py-3 px-8 rounded-xl font-medium text-white 
                     flex items-center justify-center space-x-2 overflow-hidden
                     ${(!text || isLoading) 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md hover:shadow-lg transition-all'}`}
        >
          {isLoading ? (
            <>
              <motion.span 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-flex"
              >
                <FiLoader size={20} />
              </motion.span>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <FiSend className="text-lg" />
              <span>Analyze Content</span>
            </>
          )}
          {/* Button glow effect */}
          {(!isLoading && text) && (
            <motion.span 
              className="absolute inset-0 bg-white/10"
              animate={{
                opacity: [0, 0.2, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </motion.button>
      </motion.div>
      
      <motion.div 
        className="text-center text-sm text-gray-400/80 mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p>This AI tool examines linguistic patterns and credibility markers</p>
      </motion.div>

      <AnimatePresence>
        {text.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: '100%' }}
            exit={{ opacity: 0, width: 0 }}
            className="w-full bg-gray-100 rounded-full h-2 overflow-hidden"
          >
            <motion.div 
              className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2" 
              initial={{ width: 0 }}
              animate={{ 
                width: `${Math.min(100, text.length / 5)}%`,
                backgroundPosition: ['0% 50%', '100% 50%']
              }}
              transition={{ 
                width: { duration: 0.6, type: 'spring' },
                backgroundPosition: { duration: 4, repeat: Infinity, ease: 'linear' }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
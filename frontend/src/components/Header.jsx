import { FiClock, FiZap } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export function Header({ 
  hasHistory, 
  showHistory, 
  historyCount, 
  onToggleHistory 
}) {
  return (
    <div className="flex justify-between items-center mb-12">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col"
      >
        <div className="flex items-center gap-3">
          <motion.div 
            className="relative"
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.3 }
            }}
          >
            <motion.h1 
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight"
            >
              TruthCheck
            </motion.h1>
            <motion.div 
              className="absolute -right-3 -top-3"
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              <FiZap className="text-yellow-400 w-5 h-5" />
            </motion.div>
          </motion.div>
          
          <motion.span 
            className="text-xs font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white px-2.5 py-1 rounded-full shadow-md"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
          >
            Beta
          </motion.span>
        </div>
        
        <motion.div 
          className="relative h-[3px] rounded-full mt-2 w-full overflow-hidden"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20" />
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        </motion.div>
      </motion.div>
      
      <AnimatePresence>
        {hasHistory && (
          <motion.button
            key="history-button"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ delay: 0.3 }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: showHistory 
                ? '0 10px 25px -5px rgba(99, 102, 241, 0.4)' 
                : '0 5px 15px -5px rgba(0, 0, 0, 0.1)'
            }}
            whileTap={{ scale: 0.98 }}
            onClick={onToggleHistory}
            className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-300 ${
              showHistory 
                ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
            } overflow-hidden group`}
            aria-label={`${showHistory ? 'Hide' : 'Show'} history`}
          >
            {/* Animated background */}
            {showHistory && (
              <motion.span 
                className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-pink-500/10"
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
            
            {/* Button content */}
            <div className="relative z-10 flex items-center gap-2">
              <motion.div
                animate={{
                  rotate: showHistory ? [0, 360] : 0,
                }}
                transition={{
                  duration: 1,
                  ease: "easeInOut",
                }}
              >
                <FiClock 
                  size={18} 
                  className={`flex-shrink-0 transition-colors ${
                    showHistory ? 'text-white' : 'text-blue-600'
                  }`} 
                />
              </motion.div>
              <span className="font-medium text-sm">
                {showHistory ? 'Hide History' : 'View History'}
              </span>
              <motion.span 
                className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                  showHistory 
                    ? 'bg-white/20 text-white/90 backdrop-blur-sm' 
                    : 'bg-blue-100 text-blue-800'
                }`}
                whileHover={{ scale: 1.1 }}
              >
                {historyCount}
              </motion.span>
            </div>
            
            {/* Hover effect */}
            <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
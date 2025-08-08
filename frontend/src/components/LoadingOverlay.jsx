import { motion, AnimatePresence } from 'framer-motion'
import { FiX } from 'react-icons/fi'

export function LoadingOverlay({ isLoading, sampleText, onCancel }) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-lg"
          style={{
            background: 'radial-gradient(circle at center, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)'
          }}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-700/30 bg-gray-900 p-8 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)'
            }}
          >
            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-blue-500/20"
                  initial={{
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    width: Math.random() * 8 + 2,
                    height: Math.random() * 8 + 2
                  }}
                  animate={{
                    y: [0, Math.random() * 40 - 20],
                    x: [0, Math.random() * 40 - 20],
                    opacity: [0.2, 0.8, 0.2]
                  }}
                  transition={{
                    duration: Math.random() * 5 + 3,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut'
                  }}
                />
              ))}
            </div>

            {/* Main content */}
            <div className="relative z-10 flex flex-col items-center">
              {/* Animated logo/icon */}
              <motion.div
                className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
                animate={{
                  background: [
                    'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
                    'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(236, 72, 153, 0.3) 100%)',
                    'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)'
                  ]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
              >
                <motion.div
                  className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 p-2"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                >
                  <svg viewBox="0 0 24 24" className="text-white">
                    <path
                      fill="currentColor"
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"
                      opacity="0.3"
                    />
                    <path
                      fill="currentColor"
                      d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
                    />
                  </svg>
                </motion.div>
              </motion.div>

              {/* Text content */}
              <h3 className="mb-2 text-xl font-semibold text-white">
                Analyzing Content
              </h3>
              <p className="mb-6 text-center text-gray-300">
                {sampleText ? (
                  <>
                    Verifying <span className="font-medium text-white">"{sampleText.length > 30 ? `${sampleText.substring(0, 30)}...` : sampleText}"</span>
                  </>
                ) : (
                  "Processing your content for analysis"
                )}
              </p>

              {/* Animated progress */}
              <div className="mb-8 w-full">
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
                  <motion.div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{
                      width: ['0%', '20%', '40%', '60%', '80%', '100%'],
                      left: ['0%', '20%', '40%', '60%', '80%', '0%']
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  />
                </div>
              </div>

              {/* Cancel button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCancel}
                className="flex items-center gap-2 rounded-lg bg-gray-800 px-5 py-2.5 text-sm font-medium text-gray-300 transition-all hover:bg-gray-700 hover:text-white"
              >
                <FiX className="text-lg" />
                Cancel Analysis
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
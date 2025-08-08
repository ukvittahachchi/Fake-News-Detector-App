import { useState } from 'react';
import { FiChevronDown, FiFileText } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { SAMPLE_ARTICLES } from '../data/samples';

export default function SampleDropdown({ onSelect }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative max-w-3xl mx-auto mb-8">
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border border-blue-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all flex justify-between items-center group"
        aria-expanded={isOpen}
        aria-label="Sample articles dropdown"
      >
        <div className="flex items-center space-x-3.5">
          <FiFileText className="text-blue-600 dark:text-blue-400" size={20} />
          <span className="font-medium text-blue-900 dark:text-blue-100 text-lg">Load Sample Article</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors"
        >
          <FiChevronDown size={22} />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden"
          >
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {SAMPLE_ARTICLES.map((article, index) => (
                <motion.button
                  key={index}
                  whileHover={{ backgroundColor: '#f3f4f6' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onSelect(article.content);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-6 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/80 transition-colors flex items-center border-b border-gray-100 dark:border-gray-700 last:border-0"
                  aria-label={`Select sample: ${article.title}`}
                >
                  <div className="flex flex-col">
                    <span className="truncate text-gray-800 dark:text-gray-200 font-medium text-base">
                      {article.title}
                    </span>
                    {article.description && (
                      <span className="truncate text-gray-500 dark:text-gray-400 text-sm mt-1">
                        {article.description}
                      </span>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add this to your global CSS */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c7d2fe;
          border-radius: 3px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4f46e5;
        }
      `}</style>
    </div>
  );
}
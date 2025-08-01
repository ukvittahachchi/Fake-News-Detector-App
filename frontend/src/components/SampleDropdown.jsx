import { SAMPLE_ARTICLES } from '../data/samples';

export default function SampleDropdown({ onSelect }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative max-w-3xl mx-auto mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors flex justify-between items-center"
      >
        <span>Load Sample Article</span>
        <svg 
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          {SAMPLE_ARTICLES.map((article, index) => (
            <button
              key={index}
              onClick={() => {
                onSelect(article.content);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {article.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
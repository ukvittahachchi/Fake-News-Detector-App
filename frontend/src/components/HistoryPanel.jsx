import { FiX } from 'react-icons/fi';  
import './HistoryPanel.css';

export function HistoryPanel({ 
  history, 
  loadFromHistory, 
  clearHistory, 
  onClose 
}) {
  return (
    <div className="history-panel-container">
      <div className="history-panel-header">
        <h2 className="history-panel-title">Analysis History</h2>
        <button 
          onClick={onClose}
          className="history-panel-close-btn"
          aria-label="Close history"
        >
          <FiX size={20} />
        </button>
      </div>
      <div className="history-panel-content">
        {history.length > 0 ? (
          <ul className="history-list">
            {history.map((item) => (
              <li key={item.id} className="history-item">
                <button
                  onClick={() => loadFromHistory(item)}
                  className="history-item-btn"
                  aria-label={`Load analysis from ${new Date(item.date).toLocaleString()}`}
                >
                  <div className="history-item-header">
                    <span className={`verdict-badge ${
                      item.score >= 70 ? 'verdict-high' :
                      item.score >= 40 ? 'verdict-medium' :
                      'verdict-low'
                    }`}>
                      {item.verdict}
                    </span>
                    <span className="history-date">
                      {new Date(item.date).toLocaleString()}
                    </span>
                  </div>
                  <p className="history-text-preview">
                    {item.fullText.substring(0, 200)}...
                  </p>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-history-message">
            No analysis history yet
          </div>
        )}
      </div>
      {history.length > 0 && (
        <div className="history-panel-footer">
          <button
            onClick={clearHistory}
            className="clear-history-btn"
            aria-label="Clear all history"
          >
            Clear All History
          </button>
        </div>
      )}
    </div>
  );
}
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export const analyzeText = async (text) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/analyze`, {
      text,
      metadata: {
        timestamp: new Date(),
        length: text.length
      }
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data.error || 'Analysis failed');
    } else if (error.request) {
      // No response received
      throw new Error('No response from server. Please try again.');
    } else {
      // Other errors
      throw new Error('Request failed. Please check your connection.');
    }
  }
};

// Add retry logic for failed requests
export const analyzeWithRetry = async (text, retries = 2) => {
  let lastError;
  
  for (let i = 0; i < retries + 1; i++) {
    try {
      return await analyzeText(text);
    } catch (error) {
      lastError = error;
      if (i < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  
  throw lastError;
};
import { useEffect, useState } from 'react';
import axios from 'axios';

export function useBackendStatus() {
  const [backendOnline, setBackendOnline] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const checkBackend = async () => {
      try {
        await axios.get('http://localhost:3001/api/health', {
          signal: controller.signal,
          timeout: 5000
        });
        if (isMounted) setBackendOnline(true);
      } catch (err) {
        if (isMounted) setBackendOnline(false);
        if (!axios.isCancel(err)) {
          console.error('Backend connection check failed:', err);
        }
      }
    };

    checkBackend();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  return backendOnline;
}
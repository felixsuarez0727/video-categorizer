import { useState, useCallback } from 'react';

const useFetch = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null); 
    setResult(null); 

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.detail || `HTTP error! Status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, result, error, fetchData };
};

export default useFetch;

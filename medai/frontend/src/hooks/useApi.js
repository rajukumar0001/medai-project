import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export const useApi = (apiFn, options = {}) => {
  const { showSuccessToast, showErrorToast = true, successMessage } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true); setError(null);
    try {
      const res = await apiFn(...args);
      setData(res.data);
      if (showSuccessToast && successMessage) toast.success(successMessage);
      return { success: true, data: res.data };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Something went wrong';
      setError(msg);
      if (showErrorToast) toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [apiFn, showSuccessToast, showErrorToast, successMessage]);

  const reset = () => { setData(null); setError(null); setLoading(false); };

  return { data, loading, error, execute, reset };
};

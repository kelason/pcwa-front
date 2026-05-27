import { useState, useEffect } from 'react';
import { getCategories } from '../../api';

export const ApiConnectionStatus = () => {
  const [status, setStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const getenv = (name: string, defaultValue: string) => (import.meta.env as Record<string, string | undefined>)[name] || defaultValue;
  const baseUrl = getenv("VITE_BACKEND_API_BASE_URL", "http://127.0.0.1:8000");

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // We attempt to fetch categories as a lightweight health check
        await getCategories();
        setStatus('online');
      } catch (err: unknown) {
        setStatus('offline');
        const message = err instanceof Error ? err.message : 'Network Error or API Down';
        setErrorMessage(message);
      }
    };

    checkConnection();
  }, []);

  if (status === 'loading') return null;

  return (
    <div className={`fixed bottom-4 left-4 p-3 rounded-lg shadow-lg border text-xs z-[100] transition-all animate-bounce ${
      status === 'online' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
    }`}>
      <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
        <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
        API {status === 'online' ? 'Connected' : 'Connection Failed'}
      </div>
      <p className="mt-1 opacity-70">Endpoint: {baseUrl}</p>
      {status === 'offline' && (
        <p className="mt-2 font-mono bg-white bg-opacity-50 p-1 rounded border border-red-100">
          {errorMessage}
        </p>
      )}
    </div>
  );
};
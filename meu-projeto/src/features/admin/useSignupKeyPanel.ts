import { useCallback, useEffect, useState } from 'react';
import { getSignupKey, rotateSignupKey } from '../../lib/admin-api';
import { ApiRequestError } from '../../lib/api-client';

export const useSignupKeyPanel = () => {
  const [key, setKey] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRotating, setIsRotating] = useState(false);

  const fetchKey = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getSignupKey();
      setKey(response.key);
      setExpiresAt(response.expiresAt);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Não foi possível carregar a chave');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchKey();
  }, [fetchKey]);

  // Once the key's own expiry passes, refetch: the server lazily rotates it
  // on the next read, so this is what actually enacts the 30-minute rotation
  // from the panel's point of view.
  useEffect(() => {
    if (!expiresAt) {
      return;
    }
    const msRemaining = new Date(expiresAt).getTime() - Date.now();
    if (msRemaining <= 0) {
      void fetchKey();
      return;
    }
    const timer = setTimeout(() => void fetchKey(), msRemaining + 500);
    return () => clearTimeout(timer);
  }, [expiresAt, fetchKey]);

  // Unlike fetchKey (a passive read that only rotates once the current key
  // has expired), this always issues a brand new key: it's what the
  // "Atualizar" button calls, so clicking it visibly does something even
  // when the current key still has time left.
  const rotate = useCallback(async () => {
    setIsRotating(true);
    setError(null);
    try {
      const response = await rotateSignupKey();
      setKey(response.key);
      setExpiresAt(response.expiresAt);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Não foi possível gerar uma nova chave');
    } finally {
      setIsRotating(false);
    }
  }, []);

  return { key, expiresAt, error, isLoading, isRotating, rotate };
};

import { useCallback, useEffect, useState } from 'react';
import type { CadastroRecord } from '../../../../shared/src/types/cadastro.types';
import { listCadastros } from '../../lib/cadastro-api';

export const useCadastroList = () => {
  const [records, setRecords] = useState<CadastroRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    listCadastros()
      .then((response) => {
        if (!cancelled) {
          setRecords(response.cadastros);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const addRecord = useCallback((record: CadastroRecord): void => {
    setRecords((current) => [record, ...current]);
  }, []);

  return { records, isLoading, addRecord };
};

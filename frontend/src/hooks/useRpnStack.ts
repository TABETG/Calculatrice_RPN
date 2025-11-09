// frontend/src/hooks/useRpnStack.ts
import { useEffect, useState, useCallback } from 'react';
import { apiService, StackResponse } from '../services/apiService';
import { perform as performSvc, Operation } from '../services/enhancedStackService';

type UseRpn = {
  stack: number[];
  initializing: boolean;
  loading: boolean;
  push: (value: number) => Promise<void>;
  performOperation: (op: Operation) => Promise<void>;
  clear: () => Promise<void>;
  undo: () => Promise<void>;
  refresh: () => Promise<void>;
};

export function useRpnStack(): UseRpn {
  const [stack, setStack] = useState<number[]>([]);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);

  const apply = (res: StackResponse) => setStack(res.stack ?? []);

  const refresh = useCallback(async () => {
    const res = await apiService.getStack();
    apply(res);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await refresh();
      } finally {
        setInitializing(false);
      }
    })();
  }, [refresh]);

  const push = async (value: number) => {
    setLoading(true);
    try {
      const res = await apiService.pushValue(value);
      apply(res);
    } finally {
      setLoading(false);
    }
  };

  const performOperation = async (op: Operation) => {
    setLoading(true);
    try {
      const res = await performSvc(op);
      apply(res);
    } finally {
      setLoading(false);
    }
  };

  const clear = async () => {
    setLoading(true);
    try {
      await apiService.clearStack();
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  const undo = async () => {
    // Pas d’endpoint undo exposé côté backend pour l’instant.
    // On signale proprement l’absence.
    throw new Error("La fonction 'Annuler' n'est pas encore disponible côté API");
  };

  return {
    stack,
    initializing,
    loading,
    push,
    performOperation,
    clear,
    undo,
    refresh,
  };
}

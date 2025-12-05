import { useState, useEffect } from 'react';
import { getInitialState, getState, type InitialState } from '@/lib/initialState';

export function useInitialState() {
  const [state, setState] = useState<InitialState>(getState());
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const newState = await getInitialState();
      setState(newState);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return {
    initialState: state,
    loading,
    refresh,
  };
}


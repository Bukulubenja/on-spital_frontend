import { useCallback, useState } from "react";
import { ApiError } from "../api/client";

type ActionState<T> = {
  loading: boolean;
  succeeded: boolean;
  result: T | null;
  error: string | null;
};

const initialState = { loading: false, succeeded: false, result: null, error: null };

/** Wraps a single async API call with loading/result/error state, so every workflow page doesn't hand-roll it. */
export function useAction<TArgs extends unknown[], TResult>(fn: (...args: TArgs) => Promise<TResult>) {
  const [state, setState] = useState<ActionState<TResult>>(initialState);

  const run = useCallback(
    async (...args: TArgs) => {
      setState({ loading: true, succeeded: false, result: null, error: null });
      try {
        const result = await fn(...args);
        setState({ loading: false, succeeded: true, result, error: null });
        return result;
      } catch (err) {
        const message = err instanceof ApiError ? `${err.message}` : "Request failed.";
        setState({ loading: false, succeeded: false, result: null, error: message });
        throw err;
      }
    },
    [fn],
  );

  return { ...state, run };
}

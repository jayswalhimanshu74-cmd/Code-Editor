import { create } from 'zustand';

const useWarmupStore = create((set) => ({
  isWakingUp: false,
  hasError: false,
  errorMessage: '',
  retryFn: null,

  setIsWakingUp: (isWakingUp) => set({ isWakingUp, hasError: false }),
  setError: (errorMessage, retryFn = null) => set({ isWakingUp: false, hasError: true, errorMessage, retryFn }),
  reset: () => set({ isWakingUp: false, hasError: false, errorMessage: '', retryFn: null }),
}));

export default useWarmupStore;


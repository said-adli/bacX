// Global type declarations for diagnostic utilities
declare global {
  interface Window {
    __DIAG_CHECKPOINT?: (checkpoint: string) => void;
    __DIAG_FETCH_TIME?: (time: number) => void;
  }
}

export {};

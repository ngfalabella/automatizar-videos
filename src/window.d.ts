export {};

declare global {
  interface Window {
    renderReady: boolean;
    renderAt: (seconds: number) => void;
    animationDuration: number;
  }
}

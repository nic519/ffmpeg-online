declare global {
  interface Window {
    ga_user_id?: string;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export {};

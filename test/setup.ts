import { webcrypto } from 'crypto';

// Polyfill pour crypto dans les tests
if (!globalThis.crypto) {
  (globalThis as any).crypto = webcrypto;
}

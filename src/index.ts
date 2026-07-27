export { BullBitcoin } from './client';
export type { BullBitcoinOptions, BullBitcoinSDK } from './client';

export type { AuthProvider } from './auth';
export { ApiKeyAuth } from './auth/api-key';
export { CookieAuth } from './auth/cookie';

export { BullBitcoinError } from './types';
export type { JsonRpcRequest, JsonRpcResponse, JsonRpcError } from './types';

export type { GetUserRateParams, GetUserRateResult, UserRateElement } from './methods/rates';

export type { PaymentProcessor, SimulateOrderParams, SimulateOrderElement, SimulateOrderResult, OrderFee } from './methods/orders';

// ── Default instance (lazy, from BB_API_KEY env var) ───

import { BullBitcoin } from './client';
import type { BullBitcoinSDK } from './client';

let _default: BullBitcoinSDK | null = null;

function getDefault(): BullBitcoinSDK {
  if (!_default) {
    const apiKey = process.env.BB_API_KEY;
    if (!apiKey) {
      throw new Error(
        'BB_API_KEY is not set. Use BullBitcoin.fromApiKey() to configure manually.',
      );
    }
    _default = BullBitcoin.fromApiKey(apiKey, process.env.BB_API_URL);
  }
  return _default;
}

/**
 * Default BullBitcoin instance, configured from BB_API_KEY env var.
 * Lazy-initialized on first property access.
 */
const bb: BullBitcoinSDK = new Proxy({} as BullBitcoinSDK, {
  get(_, prop) {
    return getDefault()[prop as keyof BullBitcoinSDK];
  },
});

export default bb;

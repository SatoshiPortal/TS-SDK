import type { AuthProvider } from './auth';
import { ApiKeyAuth } from './auth/api-key';
import { CookieAuth } from './auth/cookie';
import type { JsonRpcResponse } from './types';
import { BullBitcoinError } from './types';
import { bindRatesMethods } from './methods/rates';
import { bindOrdersMethods } from './methods/orders';

export interface BullBitcoinOptions {
  auth: AuthProvider;
  baseUrl?: string;
  withCredentials?: boolean;
  /** Enable debug logging (request/response payloads + errors) */
  debug?: boolean;
}

let requestId = 0;

function createInstance(options: BullBitcoinOptions) {
  const auth = options.auth;
  const baseUrl = options.baseUrl ?? 'https://api.bullbitcoin.com';
  const withCredentials = options.withCredentials ?? false;
  const debug = options.debug ?? (process.env.BB_DEBUG === 'true');

  function log(...args: unknown[]) {
    if (debug) console.log('[BullBitcoin]', ...args);
  }

  function logError(...args: unknown[]) {
    if (debug) console.error('[BullBitcoin]', ...args);
  }

  async function call<TParams, TResult>(
    service: string,
    method: string,
    params?: TParams,
  ): Promise<TResult> {
    const headers = await auth.getHeaders();
    const isApiKey = 'X-API-Key' in headers;
    const url = isApiKey
      ? `${baseUrl}/ak/api-${service}`
      : `${baseUrl}/api-${service}`;

    log(`→ ${method}`, url);
    log('  params:', JSON.stringify(params, null, 2));

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: String(++requestId),
        method,
        params,
      }),
      ...(withCredentials ? { credentials: 'include' as const } : {}),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      logError(`← HTTP ${res.status} ${res.statusText}`);
      logError('  body:', text);
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const json: JsonRpcResponse<TResult> = await res.json();

    if (json.error) {
      logError(`← ERROR ${method}:`, JSON.stringify(json.error, null, 2));
      throw new BullBitcoinError(json.error);
    }

    log(`← ${method} OK`);
    log('  result:', JSON.stringify(json.result, null, 2));

    return json.result as TResult;
  }

  return {
    /** Raw JSON-RPC call to any service */
    call,
    ...bindRatesMethods(call),
    ...bindOrdersMethods(call),
  };
}

export type BullBitcoinSDK = ReturnType<typeof createInstance>;

export const BullBitcoin = {
  create: (options: BullBitcoinOptions) => createInstance(options),

  fromApiKey: (apiKey: string, baseUrl?: string) =>
    createInstance({
      auth: new ApiKeyAuth(apiKey),
      baseUrl,
    }),

  fromCookie: (baseUrl?: string) =>
    createInstance({
      auth: new CookieAuth(),
      baseUrl,
      withCredentials: true,
    }),
};

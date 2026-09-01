// ── Types ──────────────────────────────────────────────

export interface GetUserRateParams {
  element: {
    fromCurrency: string;
    toCurrency: string;
  };
}

export interface UserRateElement {
  /** Price in smallest unit (e.g. cents) with `precision` decimals */
  userPrice: number;
  /** User group markup percentage */
  userGroupMarkup: number;
  fromCurrency: string;
  toCurrency: string;
  /** Decimal precision for the price */
  precision: number;
  /** Base price before markup */
  price: number;
  /** Currency of the price */
  priceCurrency: string;
  /** Index/mid-market price */
  indexPrice: number;
  createdAt: string;
}

export interface GetUserRateResult {
  element: UserRateElement;
}

// ── Service config ─────────────────────────────────────

const SERVICE = 'pricer';

// ── Methods ────────────────────────────────────────────

type CallFn = <TParams, TResult>(service: string, method: string, params?: TParams) => Promise<TResult>;

export function bindRatesMethods(call: CallFn) {
  return {
    /** Get directional rate between two currencies */
    getUserRate: (fromCurrency: string, toCurrency: string) =>
      call<GetUserRateParams, GetUserRateResult>(SERVICE, 'getUserRate', {
        element: { fromCurrency, toCurrency },
      }),

    /** Buy price (user buys BTC with fiat): CAD → BTC */
    getUserBuyPrice: (currency: string) =>
      call<GetUserRateParams, GetUserRateResult>(SERVICE, 'getUserRate', {
        element: { fromCurrency: currency, toCurrency: 'BTC' },
      }),

    /** Sell price (user sells BTC for fiat): BTC → CAD */
    getUserSellPrice: (currency: string) =>
      call<GetUserRateParams, GetUserRateResult>(SERVICE, 'getUserRate', {
        element: { fromCurrency: 'BTC', toCurrency: currency },
      }),
  };
}

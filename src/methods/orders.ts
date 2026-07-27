// ── Types ──────────────────────────────────────────────

export type PaymentProcessor =
  | 'IN_BITCOIN' | 'OUT_BITCOIN'
  | 'IN_LBTC' | 'OUT_LBTC'
  | 'IN_LN' | 'OUT_LN'
  | 'OUT_LNURL_WITHDRAW' | 'OUT_LNURL_PAY'
  | 'IN_CAD_USER_BALANCE' | 'OUT_CAD_USER_BALANCE'
  | 'IN_EUR_USER_BALANCE' | 'OUT_EUR_USER_BALANCE'
  | 'IN_USD_USER_BALANCE' | 'OUT_USD_USER_BALANCE'
  | 'IN_MXN_USER_BALANCE' | 'OUT_MXN_USER_BALANCE'
  | 'IN_ARS_USER_BALANCE' | 'OUT_ARS_USER_BALANCE'
  | 'IN_COP_USER_BALANCE' | 'OUT_COP_USER_BALANCE'
  | 'IN_CRC_USER_BALANCE' | 'OUT_CRC_USER_BALANCE'
  | (string & {}); // allow other values without losing autocomplete

export interface SimulateOrderParams {
  /** Amount in smallest unit (e.g. cents) */
  amount: number;
  /** true = amount is fixed on the input side, false = fixed on output side */
  isInAmountFixed: boolean;
  /** Input payment processor (e.g. 'IN_CAD_USER_BALANCE') */
  inPaymentProcessor: PaymentProcessor;
  /** Output payment processor (e.g. 'OUT_BITCOIN') */
  outPaymentProcessor: PaymentProcessor;
  /** Optional recipient ID for targeted payouts */
  recipientId?: string;
}

export interface OrderFee {
  name: string;
  amount: number;
  [key: string]: unknown;
}

export interface SimulateOrderElement {
  inAmount: number;
  outAmount: number;
  orderExchangeRate: {
    price: number;
    from: { code: string; precision: number };
    to: { code: string; precision: number };
  };
  inPaymentProcessorCurrencyCode: string;
  outPaymentProcessorCurrencyCode: string;
  orderFees: OrderFee[];
  orderClusterFees: OrderFee[];
  inTransactionFees: OrderFee[];
  inTransactionClusterFees: OrderFee[];
  outTransactionFees: OrderFee[];
  outTransactionClusterFees: OrderFee[];
}

export interface SimulateOrderResult {
  element: SimulateOrderElement;
  warning?: Array<{ code: string; message: string; [key: string]: unknown }>;
}

// ── Service config ─────────────────────────────────────

const SERVICE = 'orders';

// ── Methods ────────────────────────────────────────────

type CallFn = <TParams, TResult>(service: string, method: string, params?: TParams) => Promise<TResult>;

export function bindOrdersMethods(call: CallFn) {
  return {
    /**
     * Simulate an order to get the best option (price, fees, amounts).
     * Does not create an actual order.
     */
    simulateOrder: (params: SimulateOrderParams) =>
      call<{ amount: number; isInAmountFixed: boolean; inPaymentProcessor: string; outPaymentProcessor: string; recipientId?: string }, SimulateOrderResult>(
        SERVICE,
        'getMyBestOption',
        params,
      ),
  };
}

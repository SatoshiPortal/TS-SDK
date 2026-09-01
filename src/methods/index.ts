// @ts-nocheck
export { getUserRate, getUserBuyPrice, getUserSellPrice } from './rates';
export type { GetUserRateParams, GetUserRateResult, UserRateElement } from './rates';

export { bindOrdersMethods } from './orders';
export type { PaymentProcessor, SimulateOrderParams, SimulateOrderElement, SimulateOrderResult, OrderFee } from './orders';

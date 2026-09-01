export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number | string;
  method: string;
  params?: unknown;
}

export interface JsonRpcResponse<T = unknown> {
  jsonrpc: '2.0';
  id: number | string;
  result?: T;
  error?: JsonRpcError;
}

export interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}

export class BullBitcoinError extends Error {
  code: number;
  data?: unknown;

  constructor(error: JsonRpcError) {
    super(error.message);
    this.name = 'BullBitcoinError';
    this.code = error.code;
    this.data = error.data;
  }
}

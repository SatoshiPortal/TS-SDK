
//
// Fetch BullBitcoin API
// =====================
//
// Wrapper around fetchRpc to make call to BullBitcoin API
//

import { DeepOptional, GeneralObject, IsEmptyOrAllOptional, Optional } from "../types";
import { FetchRpcEndpointType, FetchRpcProps, FetchRpcReturn, fetchRpc } from '.'

// -------------------- Types --------------------

// Not fetchBull props for fetchBull.params (next to {service, method, ...})
//    But type for function field {params} or return.
//
// Alias to FetchRpcParamsType / FetchRpcResultType (but keep themon)
export type FetchBullParamsType = GeneralObject | null; // Alias FetchRpcParamsType
export type FetchBullResultType = any // Alias FetchRpcResultType; (any)


// FetchBull Endpoint Type
// -----------------------

// BullEndpoint are defined the same way as RpcEndpoint
//    (by setuping req:{params: ParamsType} and res: {result: ResultType})

export type FetchBullEndpointType<
  ParamsType extends FetchBullParamsType = any,
  ResultType extends FetchBullResultType = any,

// See {@@SEARCH-IsParamsOptional}
// IsParamsOptional extends boolean = boolean
> =
  // alias
  // { ParamsType: ParamsType, ResultType: ResultType }
  FetchRpcEndpointType<ParamsType, ResultType>




// Convert Bull to RPC
// -------------------
// Alias (no conversion needed) -
//  Bull Params and Result do not need to be updated to be used as Rpc
//    (only the function props are updated with default values)


export type ConvertBullEndpointToRpcParamsType<BullEndpointType extends FetchBullEndpointType = FetchBullEndpointType> = BullEndpointType['ParamsType'];

// Alias (no conversion needed)
//    Rpc result do not need to be updated to be used as Bull result
export type ConvertBullEndpointToRpcResultType<BullEndpointType extends FetchBullEndpointType = FetchBullEndpointType> = BullEndpointType['ResultType'];

export type ConvertBullToRpcEndpointType<BullEndpointType extends FetchBullEndpointType = FetchBullEndpointType> =
  FetchRpcEndpointType<
    ConvertBullEndpointToRpcParamsType<BullEndpointType>,  // => RPC.ParamsType
    ConvertBullEndpointToRpcResultType<BullEndpointType>   // => RPC.ResultType
  // BullEndpointType['IsParamsOptional']  // (See {@@SEARCH-IsParamsOptional})
  >



// FetchBull Props/Return Type
// ---------------------------
// What props await fetchBull and that's returned by fetchBull

export type FetchBullProps<BullEndpointType extends FetchBullEndpointType = FetchBullEndpointType> =
  // Same props as RPC props but `url` is optional
  Optional<
    FetchRpcProps<ConvertBullToRpcEndpointType<BullEndpointType>>
    , 'url'> // {url} is Optional

  //  Add {service} helper on fetchBull props
  & {
    service: string
  }

// Alias
//    No conversion needed, we could use FetchRpcReturn
//    but in case of future updates keep converting
export type FetchBullReturn<BullEndpointType extends FetchBullEndpointType = FetchBullEndpointType> =
  FetchRpcReturn<ConvertBullToRpcEndpointType<BullEndpointType>>




// Convert Props/Return Function
// -----------------------------
//  Convert Bull Props to Rpc Props
//    (so fetchBull can use fetchRpc, or any future implementation of fetchApi could be used with Rpc props)


export const convertBullToRpcProps = <BullEndpointType extends FetchBullEndpointType = FetchBullEndpointType>({
  url,
  service,

  ...props
}: FetchBullProps<BullEndpointType>): FetchRpcProps<ConvertBullToRpcEndpointType<BullEndpointType>> => {

  // @@TODO: Update this to allow setupBullApi
  //    to helpthe project to setup global Bull Api Settings
  //    and direclty inject/update rpc props:
  //
  //  - env (prod, preprod, dev) => setup URL,
  //  - credential (cookies / API Key / ... )
  //  - ...

  const _url = url || process.env.NEXT_PUBLIC_BB_API_URL || 'https://api.bullbitcoin.com/';

  return {
    credentials: "include" as RequestCredentials, // See https://github.com/microsoft/TypeScript/issues/17363
    url: new URL(service ? `api-${service}` : '', _url).toString(),
    ...props,

    //
    // Force params to be defined
    // This is caused by TransformRpcParamsToApiDataReqType who force {params} to be here IF defined on type.
    //
    // 2 solutions:
    // ------------
    // params: props.params || {},
    params: props.params// as FetchRpcProps<BullEndpointType>['params']
  } //as FetchRpcProps<BullEndpointType>
};


// Alias - Same return as fetchRpc
export const convertRpcToBullReturn = <BullEndpointType extends FetchBullEndpointType = FetchBullEndpointType>(
  apiReturn: FetchRpcReturn<ConvertBullToRpcEndpointType<BullEndpointType>>
): FetchBullReturn<BullEndpointType> => apiReturn;






// FetchBull Function
// -----------------

// Propose a function to direclty call a Bull Endpoint using a single function

// Define the type of the function (to be reused to create helper per endpoint)
export type FetchBullType<BullEndpointType extends FetchBullEndpointType = FetchBullEndpointType> = (
  props: FetchBullProps<BullEndpointType>
) => Promise<FetchBullReturn<BullEndpointType>>



export async function fetchBull<BullEndpointType extends FetchBullEndpointType = FetchBullEndpointType>(
  bullProps: FetchBullProps<BullEndpointType>
): Promise<FetchBullReturn<BullEndpointType>> {

  // Convert props to works with fetchRpc
  const res = await fetchRpc(convertBullToRpcProps(bullProps));

  // We receive an RpcReturn and want to convert it as a BullReturn
  return convertRpcToBullReturn(res);
}




// CreateBullEndpoint
// ------------------
// Helper to generate easy to use typed function
//    where only params are requested
// @@TODO: Create as version without params (only props) in case params is null


//
// Define the type
//

export type CreateBullEndpointType<BullEndpointType extends FetchBullEndpointType = FetchBullEndpointType> =
  // null extends FetchBullProps<BullEndpointType>['params']
  true extends IsEmptyOrAllOptional<FetchBullProps<BullEndpointType>['params']>
  ? (
    // Make params optional if it can be null
    params?: FetchBullProps<BullEndpointType>['params'] /*| GeneralObject*/, // Allow to send {} as props instead of null ?
    props?: Partial<FetchBullProps<BullEndpointType>>
  ) => Promise<FetchBullReturn<BullEndpointType>>
  : (
    // Require params if it cannot be null
    params: FetchBullProps<BullEndpointType>['params'] /* & GeneralObject */, // Allow to add additional props ?
    props?: Partial<FetchBullProps<BullEndpointType>>
  ) => Promise<FetchBullReturn<BullEndpointType>>;


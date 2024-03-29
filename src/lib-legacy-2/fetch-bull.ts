

//
// Fetch BullBitcoin API
// =====================
//
// Wrapper around fetchRpc to make call to BullBitcoin API
//

import { GeneralObject, Optional } from "../types";
import { FetchRpcEndpointType, FetchRpcProps, FetchRpcReturn, fetchRpc } from '.'

// -------------------- Types --------------------

// Not fetchBull props for fetchBull.params (next to {service, method, ...})
//    But type for function field {params} or return.
//
// Alias to FetchRpcParamsType / FetchRpcResultType (but keep themon)
export type FetchBullParamsType = GeneralObject | null; // Alias FetchRpcParamsType
export type FetchBullResultType = any // Alias FetchRpcResultType; (any)


// FetchBull Endpoint Type
// ----------------------

// BullEndpoint are defined the same way as RpcEndpoint
//    (by setuping req:{params: ParamsType} and res: {result: ResultType})

export type FetchBullEndpointType<
  ParamsType extends FetchBullParamsType = any,
  ResultType extends FetchBullResultType = any,
  IsParamsOptional extends boolean = boolean
> =
  // alias
  FetchRpcEndpointType<ParamsType, ResultType, IsParamsOptional>
// {
//   ParamsType: ParamsType,
//   ResultType: ResultType,
// }


// Convert Bull to RPC
// -------------------
// How to use fetchRpc with Bull type definition
//
// Convert bull endpoint (params,result) as Rpc endpoint (params,result)
// Make possible to re-use type defined for fetchBull with fetchRpc (or even fetchApi by converting again from Rpc to Api)

//
//
// @QUESTION: Remove Convert function here ?!
//      Useless - But keep them help to construct functions to keep always the same patern
//        Api => Rpc / Rpc => Bull / Bull => Entity ...
//
//

// Alias (no conversion needed) -
//  Bull Params do not need to be updated to be used as Rpc Params (only the function props are updated)
export type ConvertBullEndpointToRpcParamsType<BullEndpointType extends FetchBullEndpointType = FetchBullEndpointType> = BullEndpointType['ParamsType'];

// Alias (no conversion needed)
//    Rpc result do not need to be updated to be used as Bull result
export type ConvertBullEndpointToRpcResultType<BullEndpointType extends FetchBullEndpointType = FetchBullEndpointType> = BullEndpointType['ResultType'];


// Alias (no conversion needed)
//    Both Params and Result do not need conversion between Bull and RPC
export type ConvertBullToRpcEndpointType<BullEndpointType extends FetchBullEndpointType = FetchBullEndpointType> =
  FetchRpcEndpointType<
    ConvertBullEndpointToRpcParamsType<BullEndpointType>,  // => RPC.ParamsType
    ConvertBullEndpointToRpcResultType<BullEndpointType>,  // => RPC.ResultType
    BullEndpointType['IsParamsOptional']
  >


// FetchBull Props/Return Type
// ---------------------------
// What props await fetchBull and that's returned by fetchBull

export type FetchBullProps<BullEndpointType extends FetchBullEndpointType = FetchBullEndpointType> =
  Optional<
    // (Alias - no need but keep it in case of future update ?)
    //  FetchRpcProps<BullEndpointType> === FetchRpcProps<ConvertRpcToApiEndpointType<BullEndpointType>>
    FetchRpcProps<ConvertBullToRpcEndpointType<BullEndpointType>>

    , 'url'> // {url} is Optional
  //  Add only {service} on fetchBull props
  & {
    service: string
  }

// Alias (FetchRpcReturn - but keep it in case of future update ?)
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
}: FetchBullProps<BullEndpointType>): FetchRpcProps<BullEndpointType> => {

  // @TODO: Update this to allow setupBullApi
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
    params: props.params as FetchRpcProps<BullEndpointType>['params']
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

//
// Define the type
//
//
// Version without props {service, method} to create helper for every endpoint
export type CreateBullEndpointType<BullEndpointType extends FetchBullEndpointType = FetchBullEndpointType> = (
  // First function props is only {params}
  params: FetchBullProps<BullEndpointType>['params'],
  // Allow to send every fetch rpc props
  props?: Partial<FetchBullProps<BullEndpointType>>
) => Promise<FetchBullReturn<BullEndpointType>>


// Usage:
// ------
// type GetGroupEndpointType = FetchBullEndpointType<
//   { groupCode: string },
//   { element: GroupType }
// >
// const getGroup: CreateBullEndpointType<GetGroupEndpointType> = async (params, props = {}) => {
//   return await fetchBull({
//     service: 'permissions',
//     method: 'getGroup',
//     ...props,
//     params: { ...props.params, ...params, },
//   })
// }
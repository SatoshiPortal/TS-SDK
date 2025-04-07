//
// Fetch RPC API
// =============
//
// Wrapper around fetchApi to make it works easier with RPC calls
//

import { uuid } from "uuidv4";
import { FetchApiEndpointType, FetchApiProps, FetchApiReturn, GeneralObject, IsEmptyOrAllOptional, fetchApi } from "..";


// -------------------- Types --------------------

export type FetchRpcParamsType = GeneralObject | null; // Alias FetchApiDataReqType
export type FetchRpcResultType = any // Alias FetchApiDataResType; (any)


// FetchRpc Endpoint Type
// ----------------------

// RPC Enpoint are defined by types of:
//  * `req.body.data.params`
//  * `res.data.result`

//
// {@@SEARCH-IsParamsOptional}
//  @@NOTE: To avoid over complexity, for now fetchRpc always have optional params type.
//  @@TODO: See (later) if we can handle it better,
//          BUT the more important is `getBull__()` so for now don't care about it
//

export type FetchRpcEndpointType<
  ParamsType extends FetchRpcParamsType = any,
  ResultType extends FetchRpcResultType = any,
// IsParamsOptional extends boolean = boolean
> = {
  ParamsType: ParamsType,
  ResultType: ResultType,
  // IsParamsOptional: IsParamsOptional //  We tried with `IsEmptyOrAllOptional<RpcEndpointType['ParamsType']> extends true` but look like it's not working fine with AdditionalParamsType ..
}


// Convert RPC to API
// ------------------
// How to use fetchApi with RPC type definition
//
// Convert RPC endpoint (params,result) as API endpoint (dataReq, dataRes)
// Make possible to reuse type defined for fetchRPC with fetchAapi


// As fetchApi point of view, what's contained inside DataReq when we do a fetchRpc call ?
export type ConvertRpcEndpointToApiDataReqType<RpcEndpointType extends FetchRpcEndpointType = FetchRpcEndpointType> = {
  id?: number | string;
  jsonrpc?: string; // 2.0
  method?: string; // RPC endpoint

  // @@NOTE: Easy version where fetchRpc.params is always optional. (@@SEARCH-IsParamsOptional)
  // params?: RpcEndpointType['ParamsType'];
  // @@FIX: Allow to receive `| {}` in case fetchBull require no params
  // params?: RpcEndpointType['ParamsType'] | {};
}

  // @@TODO (@@SEARCH-IsParamsOptional)
  // ------
  //    Replace optional params by that.

  // If RpcParamsType is specify => params is mandatory, if not params is optional
  // (IsNeverOrEmpty<ParamsType> extends true
  // (IsEmptyOrAllOptional<RpcEndpointType['ParamsType']> extends true
  // & (RpcEndpointType['IsParamsOptional'] extends true

  // & (null extends RpcEndpointType['ParamsType'] // extends null
  & (true extends IsEmptyOrAllOptional<RpcEndpointType['ParamsType']> // extends null
    ? {
      params?: RpcEndpointType['ParamsType']; // RPC params devient optionnel
    }
    : {
      params: RpcEndpointType['ParamsType']; // RPC params est obligatoire
    }
  ) | null;


// As fetchApi point of view, what's returned inside DataRes ?
export type ConvertRpcEndpointToApiDataResType<RpcEndpointType extends FetchRpcEndpointType = FetchRpcEndpointType> = {
  id?: number | string
  jsonrpc?: string      // 2.0
  result?: RpcEndpointType['ResultType']   // RPC result
} | null

export type ConvertRpcToApiEndpointType<RpcEndpointType extends FetchRpcEndpointType = FetchRpcEndpointType> =
  FetchApiEndpointType<
    ConvertRpcEndpointToApiDataReqType<RpcEndpointType>,  // DataReq
    ConvertRpcEndpointToApiDataResType<RpcEndpointType>   // DataRes
  >



// FetchRpc Props/Return Type
// --------------------------
// What props await fetchRpc and that's returned by fetchRpc


// We want as fetchRpc props to be: { id = 1, method, params, ...props }
//   where {id, method, params} are fetchApi's data

export type FetchRpcProps<RpcEndpointType extends FetchRpcEndpointType = FetchRpcEndpointType> =
  // Any FetchApi default props (without {id, method, params}) we want at the root level of function props
  FetchApiProps<
    Omit<ConvertRpcToApiEndpointType<RpcEndpointType>, 'id' | 'method' | 'params'>
  >
  // Add RPC Props at root level of the fetchRpc function (help send them)
  & ConvertRpcEndpointToApiDataReqType<RpcEndpointType>


export type FetchRpcReturn<RpcEndpointType extends FetchRpcEndpointType = FetchRpcEndpointType> =
  // Anythng who as been returned by fetchApi by default (without data)
  Omit<FetchApiReturn<
    ConvertRpcToApiEndpointType<RpcEndpointType>
  >, 'data'> & {
    data: RpcEndpointType['ResultType'] // Rpc res.data is ResultType (instead of res.data.result)
  }



// Convert Props/Return Function
// -----------------------------
//  Convert RPC Props to Api Props
//    (so fetchRpc can use fetchApi, or any future implementation of fetchApi could be used with Rpc props)


export const convertRpcToApiProps = <RpcEndpointType extends FetchRpcEndpointType = FetchRpcEndpointType>(
  { id = uuid(), method, params, ...props }: FetchRpcProps<RpcEndpointType>
): FetchApiProps<ConvertRpcToApiEndpointType<RpcEndpointType>> => {

  return {
    // By default all RPC request are POST
    requestMethod: 'post',

    // Allow to override fetchApi props
    ...props,

    // data (future strigified fetch.body)
    data: {
      jsonrpc: "2.0",
      ...(props.data || {}),
      id,
      method,
      // avoid {params: {}}
      ...((params && Object.keys(params).length > 0) ? { params } : {}),
    }
  };
};


export const convertApiToRpcReturn = <RpcEndpointType extends FetchRpcEndpointType = FetchRpcEndpointType>(
  apiReturn: FetchApiReturn<ConvertRpcToApiEndpointType<RpcEndpointType>>
): FetchRpcReturn<RpcEndpointType> => ({

  // Return everything we had on original fetchApi res
  ...apiReturn,

  // Replace res.data by res.data.result (to easier get RpcReturn, original is style is res.body.data.result)
  data: apiReturn.data.result,
});

// FetchRpc Function
// -----------------
// Propose a function to direclty call an API using a Rpc


// Define the type of the function (to be reused to create helper per endpoint)
export type FetchRpcType<RpcEndpointType extends FetchRpcEndpointType = FetchRpcEndpointType> = (
  props: FetchRpcProps<RpcEndpointType>
) => Promise<FetchRpcReturn<RpcEndpointType>>


export async function fetchRpc<RpcEndpointType extends FetchRpcEndpointType = FetchRpcEndpointType>(
  rpcProps: FetchRpcProps<RpcEndpointType>
): Promise<FetchRpcReturn<RpcEndpointType>> {

  // Convert props to works with fetchApi
  const res = await fetchApi(convertRpcToApiProps(rpcProps));

  // We receive an ApiReturn and want to transform it as a RpcReturn
  return convertApiToRpcReturn(res);
}

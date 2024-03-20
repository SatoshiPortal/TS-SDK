
import { GeneralObject, IsNeverOrEmptyOrAllOptional, Optional } from "../types";
import { FetchApiEndpointType, FetchApiProps, FetchApiReturn, fetchApi } from "./fetch-api";

//
// Fetch RPC API
// =============
//
// Wrapper around fetchApi to make it works easier with RPC calls
//


// -------------------- Types --------------------

export type FetchRpcParamsType = GeneralObject | null; // Alias FetchApiDataReqType
export type FetchRpcResultType = any // Alias FetchApiDataResType; (any)



// FetchRpc Endpoint Type
// ----------------------

// RPC Enpoint are defined by types of:
//  * `req.body.data.params`
//  * `res.data.result`

export type FetchRpcEndpointType<ParamsType extends FetchRpcParamsType = any, ResultType extends FetchRpcResultType = any> = {
  ParamsType: ParamsType,
  ResultType: ResultType,
}



// Convert RPC to API
// ------------------
// How to use fetchApi with RPC type definition
//
// Convert RPC endpoint (params,result) as API endpoint (dataReq, dataRes)
// Make possible to reuse type defined for fetchRPC with fetchAapi


// When fetchRpc receive props, who to convert then in order to use it with fetchApi

export type ConvertRpcParamsToApiDataReqType<ParamsType extends FetchRpcParamsType = any> =
  // If RpcParamsType is specify => params is mandatory, if not params is optional
  // (IsNeverOrEmpty<ParamsType> extends true
  (IsNeverOrEmptyOrAllOptional<ParamsType> extends true
    ? {
      id?: number;
      jsonrpc?: string; // 2.0
      method?: string; // RPC endpoint
      params?: ParamsType; // RPC params devient optionnel
    }
    : {
      id?: number;
      jsonrpc?: string; // 2.0
      method?: string; // RPC endpoint
      params: ParamsType; // RPC params est obligatoire
    }
  ) | null;

// When fetchApi will receive a result made for fetchRpc:
//    api.data will be ApiDataRes: {id, jsonrpc, result: ResultType}
export type ConvertRpcResultToApiDataResType<ResultType extends FetchRpcResultType = any> = {
  id?: number
  jsonrpc?: string      // 2.0
  result?: ResultType   // RPC result
} | null

export type ConvertRpcToApiEndpointType<RpcEndpointType extends FetchRpcEndpointType = FetchRpcEndpointType> =
  FetchApiEndpointType<
    ConvertRpcParamsToApiDataReqType<RpcEndpointType['ParamsType']>,  // DataReq
    ConvertRpcResultToApiDataResType<RpcEndpointType['ResultType']>   // DataRes
  >


// FetchRpc Props/Return Type
// --------------------------
// What props await fetchRpc and that's returned by fetchRpc

export type FetchRpcProps<RpcEndpointType extends FetchRpcEndpointType = FetchRpcEndpointType> =
  // Any FetchApi default props (without {id, method, params}) we want at the root level of function props
  FetchApiProps<
    Omit<ConvertRpcToApiEndpointType<RpcEndpointType['ParamsType']>, 'id' | 'method' | 'params'>
  >
  // Add RPC Props at root level of the fetchRpc function (help send them)
  & ConvertRpcParamsToApiDataReqType<RpcEndpointType['ParamsType']>


export type FetchRpcReturn<RpcEndpointType extends FetchRpcEndpointType = FetchRpcEndpointType> =
  // Anythng who as been returned by fetchApi by default (without data)
  Omit<FetchApiReturn<
    ConvertRpcToApiEndpointType<RpcEndpointType['ResultType']>
  >, 'data'> & {
    data: RpcEndpointType['ResultType'] // Rpc res.data is ResultType (instead of res.data.result)
  }


// Convert Props/Return Function
// -----------------------------
//  Convert RPC Props to Api Props
//    (so fetchRpc can use fetchApi, or any future implementation of fetchApi could be used with Rpc props)


export const convertRpcToApiProps = <RpcEndpointType extends FetchRpcEndpointType = FetchRpcEndpointType>(
  { id = 1, method, params, ...props }: FetchRpcProps<RpcEndpointType>
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




/*
// -------------------- Types --------------------

export type FetchRpcParamsType = GeneralObject | null;



// FetchRpc Data Type
// ------------------

// Transform a RPC Params Type (fetch body.params) into an API Data Request (fetch body)
export type TransformRpcParamsToApiDataReqType<RpcParamsType extends FetchRpcParamsType = any> =
  // If RpcParamsType is specify params is mandatory, if not params is optional
  (IsNeverOrEmpty<RpcParamsType> extends true
    ? {
      id?: number;
      jsonrpc?: string; // 2.0
      method?: string; // RPC endpoint
      params?: RpcParamsType; // RPC params devient optionnel
    }
    : {
      id?: number;
      jsonrpc?: string; // 2.0
      method?: string; // RPC endpoint
      params: RpcParamsType; // RPC params est obligatoire
    }
  ) | null;

// Transform a RPC Result Type into an API Data Response
export type TransformRpcResultToApiDataResType<ResultResType = any> = {
  id?: number
  jsonrpc?: string        // 2.0
  result?: ResultResType  // RPC result
} | null




// FetchRpc Endpoint Type
// ----------------------
// Allow to handle Request and Return type in a single TS Type

export type FetchRpcEndpointType<ParamsReqType extends FetchRpcParamsType = any, ResultResType = any> = {
  ParamsReqType: ParamsReqType
  ResultResType: ResultResType
}

// Transform an RpcEndpointType to ApiEndpointType
//    we receive the RPC params type as request, and RPC result type avec return value
//    and we want to the be trasnformed as a API DataReq and API DataRes (to be usable with fetchApi - and FetchApi types)
//
// * (rpc) ParamsReqType => (api) DataReqType
// * (rpc) ResultResType => (api) DataResType
export type TransformRpcToApiEndpointType<RpcEndpointType extends FetchRpcEndpointType = FetchRpcEndpointType> = FetchApiEndpointType<
  TransformRpcParamsToApiDataReqType<RpcEndpointType['ParamsReqType']>, // DataReqType
  TransformRpcResultToApiDataResType<RpcEndpointType['ResultResType']>  // DataResType
>



// FetchRpc Props/Return
// ---------------------
// What's type the fetchRpc wait as props and will return

export type FetchRpcProps<RpcEndpointType extends FetchRpcEndpointType = FetchRpcEndpointType> = FetchApiProps<Omit<TransformRpcToApiEndpointType<RpcEndpointType>, 'params' | 'id' | 'method'>> & TransformRpcParamsToApiDataReqType<RpcEndpointType['ParamsReqType']>

export type FetchRpcReturn<RpcEndpointType extends FetchRpcEndpointType = FetchRpcEndpointType> =
  Omit<FetchApiReturn<TransformRpcToApiEndpointType<RpcEndpointType>>, 'data'>
  & {
    data: RpcEndpointType['ResultResType']
  }

// RpcProps to ApiProps
// --------------------
//  Transform RPC Props to Api Props
//    So a function/component who use fetchApi can be used with fetchRcp props


export const transformRpcToApiProps = <RpcEndpointType extends FetchRpcEndpointType = FetchRpcEndpointType>({ id = 1, method, params, ...props }: FetchRpcProps<RpcEndpointType>): FetchApiProps<TransformRpcToApiEndpointType<RpcEndpointType>> => {
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
      ...(params ? { params } : {}),
    }
  };
};


// ApiResult to RpcResult
// ----------------------
//  Transform an Api Result into an Rpc Result

export const transformApiToRpcResult = <RpcEndpointType extends FetchRpcEndpointType = FetchRpcEndpointType>(apiReturn: FetchApiReturn<TransformRpcToApiEndpointType<RpcEndpointType>>): FetchRpcReturn<RpcEndpointType> => {
  return {
    ...apiReturn,

    // RpcReturn.data is ApiReturn.data.result to make easiest to use
    data: apiReturn.data?.result || {},
  }
};

// FetchRpc Function
// -----------------
// Propose a function to direclty call an API using a Rpc

export async function fetchRpc<RpcEndpointType extends FetchRpcEndpointType = FetchRpcEndpointType>(rpcProps: FetchRpcProps<RpcEndpointType>): Promise<FetchRpcReturn<RpcEndpointType>> {

  const res = await fetchApi(transformRpcToApiProps(rpcProps));


  // We receive an ApiReturn and want to transform it as a RpcReturn
  return transformApiToRpcResult(res);
}

*/
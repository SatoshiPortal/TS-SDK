

import { DeepPartial, GeneralObject } from "../types";
// import { cookiesToString } from "./utils";

//
// Fetch API
// =========
//
// Improved fetch function to help call various API.
//



// -------------------- Types --------------------

// Default FetchAPI Data Request/Response
export type FetchApiDataReqType = GeneralObject | null;
export type FetchApiDataResType = any;

// FetchApi Endpoint Type
// ----------------------
// Allow to handle Request and Return type in a single TS Type

export type FetchApiEndpointType<DataReqType extends FetchApiDataReqType = any, DataResType extends FetchApiDataResType = any> = {
  DataReqType: DataReqType,
  DataResType: DataResType,
}

// FetchApi Request Type
// ---------------------


// FetchAPI Props
export type FetchApiProps<ApiEndpointType extends FetchApiEndpointType = FetchApiEndpointType> =
  Omit<RequestInit, 'method' | 'body'>
  & {

    // Request (url, queryParams, method, ...)
    // ---------------------------------------

    // Have URL and Query Params on the same object to help manipulate everything together
    url: string,
    queryParams?: string | string[][] | Record<string, string> | URLSearchParams | undefined,
    // Rename default `fetch.method` to `fetchApi.requestMethod`
    //  (to avoid conflict between `fetch props` (method "GET" | "POST") and `RPC props data.method (RPC Method)` who will be flatten into FetchRpcApiProps)
    requestMethod?: Request['method'],


    // Request content (POST body)
    // ---------------------------

    // Default fetch function want `body` to be a string... Not easy to handle.
    //  So override (and rename it) to be an object (fetchApi will handle (object)data => (string)body)
    data?: ApiEndpointType['DataReqType'], // Any object


    // Trigger callback
    // ----------------

    // Trigger a callabck when fetch as been received
    onFetch?: (props: FetchApiReturn<ApiEndpointType>) => void


    // Cookies handling
    // ----------------

    //
    // @TODO:
    // Review this part when we will handle Auth etc..
    //
    // cookies?: any,


    // Server Component can pass only plain-object to Client-Side component
    // By default `avoidNonPlainObject = !!cookies`
    avoidNonPlainObject?: boolean,
  }

// FetchApi Return Type
// --------------------

export type FetchApiReturn<ApiEndpointType extends FetchApiEndpointType = FetchApiEndpointType> =
  // (
  //   FetchApiSuccessReturn<DataResType>
  //   | FetchApiErrorReturn<DataResType>
  // )
  // &
  {

    // Extracted data (to help use it)
    // -------------------------------
    // FetchApiReturnSuccess | FetchApiReturnError
    //    but will be easier to be handled like that... (for future typing)
    data: Partial<ApiEndpointType['DataResType']>, // Content of the result
    error?: Error // Can be a network error OR Server data error

    status?: number

    // Request props
    // -------------
    // Props receive by the fetchApi function
    //
    req?: FetchApiProps<ApiEndpointType> & {
      url?: string, // URL cannot be sent from Server Component to Client Component, so better to send string (and URL it Client Side if needed)
    },
    // Solution to fix ListEntities result error where {params} is required because QueryList is specified, but should not
    // req?: DeepPartial<FetchApiProps<ApiEndpointType> & {
    //   url?: string, // URL cannot be sent from Server Component to Client Component, so better to send string (and URL it Client Side if needed)
    // }>,


    // Extracted Reponse
    // -----------------
    // data who can be used easly

    res?: {
      // Extracted data
      body?: any,
      isJson?: boolean,
      status?: number,
      statusText?: string,
    },

    // Raw Fetch
    // ---------
    // Real objects sent to and received from the fetch fonction

    raw: {
      url?: string,     // if URL(props.url)throw an error, we cannot specify it on Error Return
      req: RequestInit,
      res?: Response,
    }
  };

export type FetchApiErrorType = {
  name: string,
  message: string,
  code: string,
  status?: number,
  e?: Error,      // Avoided when `avoidNonPlainObject` (cannot be sent from Server Component to Client Component) - Try to avoid use it as it could not be here

  // @TODO: Move this to FetchRpcApiErrorType
  //
  // JSON ERROR CODE
  // -32700 	Parse error 	Invalid JSON was received by the server.
  // -32600 	Invalid Request 	The JSON sent is not a valid Request object.
  // -32601 	Method not found 	The method does not exist / is not available.
  // -32602 	Invalid params 	Invalid method parameter(s).
  // -32603 	Internal error 	Internal JSON-RPC error.
  // -32000 to -32099 	Server error 	Reserved for implementation-defined server-errors.
  // rpcCode?: number,
}






// FetchApi Type
// -------------
// Type of the fetchApi function

export type FetchApiType<ApiEndpointType extends FetchApiEndpointType = FetchApiEndpointType> = (
  props: FetchApiProps<ApiEndpointType>
) => Promise<FetchApiReturn<ApiEndpointType>>;

// -------------------- Intern Helper function (createFetchApiError, catchError) --------------------

const createFetchApiError = (e: Error | Partial<FetchApiErrorType>, avoidNonPlainObject: boolean): FetchApiErrorType => {

  // In case we receive an Error, return a wrapper around it
  if (e instanceof Error) {
    return {
      name: e.name,
      message: e.message,
      code: 'ERR_NO_CODE',
      e
    };
  }

  // Else create a custom error
  const _apiError = {
    name: "Error",
    message: "No Information on error",
    code: 'ERR_NO_CODE',
    ...e,
  };

  // Error is a plain Object who cannot be return from ServerComponent to ClientComponent, so allow to avoid it
  if (!avoidNonPlainObject) {
    _apiError.e = new Error(_apiError.message);
    _apiError.e.name = _apiError.name;
    _apiError.e.message = _apiError.message;
  }

  return _apiError;
}

// Catch an error (can be an Error, or fetch Result)
//   Then return as an FetchApiState
const catchError = <ApiEndpointType extends FetchApiEndpointType = FetchApiEndpointType>(
  res: FetchApiReturn<ApiEndpointType>, e: any, status: number, avoidNonPlainObject: boolean
): FetchApiReturn => {
  if (e instanceof Error) {
    return {
      ...res,
      status, // ?? Request Error
      error: createFetchApiError(e, avoidNonPlainObject),
    }
  }
  return {
    ...res,
    status: e.status,
    error: e.error,
  }
}


// -------------------- fetchApi - Main function --------------------


export async function fetchApi<ApiEndpointType extends FetchApiEndpointType = FetchApiEndpointType>(
  props: FetchApiProps<ApiEndpointType>
): Promise<FetchApiReturn<ApiEndpointType>> {

  const { url, queryParams, ...restProps } = props;

  // Initial empty data
  // -> Will define the orders of the fields (most important on top)
  let _res: FetchApiReturn = {
    status: null,
    data: {},
    req: null,
    res: null,
    raw: { req: props }
  };

  // ==============================
  //
  //  Prepare fetch / Helpers
  //
  // ==============================

  // By default (if not overrided)
  //    when we receive cookies we are ServerSide
  //    and Server Component cannot send Plain Object to Client Component, so avoid them
  const avoidNonPlainObject: boolean = (typeof restProps.avoidNonPlainObject === 'boolean')
    ? restProps.avoidNonPlainObject
    : false // @TODO: !!restProps.cookies;


  // Allow to propagate (call onFetch) and return in one-line
  const propagateAndReturn = (res: FetchApiReturn<ApiEndpointType>): FetchApiReturn<ApiEndpointType> => {
    props.onFetch?.(res);
    return res;
  }


  // ==============================
  //
  //  Manage URL
  //
  // ==============================

  // ! Url at all, return a request error
  if (!url) {
    return propagateAndReturn({
      ..._res,
      status: 404,
      error: createFetchApiError({ name: 'URL', message: 'Undefined URL', code: 'ERR_NO_URL' }, avoidNonPlainObject),
    });
  }

  let _url;
  try {

    // @TODO - Do we need that here ?! Or later on Common repo (it's used only for BullTeam)
    // -----
    // If url start with `/`, add `NEXT_PUBLIC_URL` as baseUrl
    // _url = new URL(url, url.startsWith("/") && process.env.NEXT_PUBLIC_URL ? process.env.NEXT_PUBLIC_URL : undefined);
    _url = new URL(url)

    // Transform all possible way to send queryParams into a valid string
    if (queryParams) {
      const _search = new URLSearchParams(queryParams);
      _url.search = _search.toString();
    }
  }
  catch (e) {
    return propagateAndReturn({
      ..._res,
      status: 404,
      error: createFetchApiError({ name: 'URL', message: 'Invalid URL', code: 'ERR_INVALID_URL' }, avoidNonPlainObject),
    });
  }

  // ==============================
  //
  //  Build fetch request
  //
  // ==============================


  // let _res: FetchApiReturn = { data: {}, raw: { req: props } };

  // Original request/response
  let _request: RequestInit;
  let _response: Response;


  try {

    const { data, requestMethod = "get", /*@TODO: cookies,*/ headers, ...rest } = restProps;

    // const isFile = (data instanceof FormData) && (data.get('file') instanceof File);
    const isFile = !!(data?.get?.('file') instanceof File);

    _request = {
      // Transform ApiPros to requested RequestInit
      ...rest,
      // Renamed method to requestMethod (was done to avoid future-conflict name with RPC)
      method: requestMethod,

      // if data ? Send as stringifidy bode (and add header.Content-Type: 'application/json')
      ...(data ? {
        body: isFile ? data : JSON.stringify(data),
      } : {}),

      ...(data || /*@TODO: cookies ||*/ headers ? {
        headers: {
          ...(isFile ? {} : data ? { "Content-Type": "application/json" } : {}),
          // @TODO:
          // ...(cookies ? { "Cookie": cookiesToString(cookies().getAll()) } : {}),
          ...(headers || {})
        }
      } : {}),

      // params: props.queryParams || {},
    } as RequestInit;

    _res.req = {
      ...props,
      url: url.toString(),
    },

      // ==============================
      //  Fetch
      // ==============================

      _response = await fetch(_url, _request);
  }
  catch (e) {
    return propagateAndReturn(catchError(_res, e, 500, avoidNonPlainObject));
  }


  // ==============================
  //
  //  Build fetch response
  //
  // ==============================

  let _body;

  try {

    // Fetch Body content (text or json...)
    const isJson = _response.headers.get('content-type')?.includes('application/json') || false;
    if (isJson) {
      // @QUESTION
      //    This cause issue: (Don't know why... ?)
      //    <w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (____Kib) impacts deserialization performance (consider using Buffer instead and decode when needed)
      //
      _body = await _response.json(); // Keep original json
    }
    else {
      _body = await _response.text();
    }


    if (!_response.ok) {
      _res.error = createFetchApiError({ name: 'Network Error', message: _response.statusText, code: `ERR_NETWORK`, status: _response.status }, avoidNonPlainObject)
    }
    // Build reponse object
    _res.res = {
      status: _response.status,
      statusText: _response.statusText,
      body: _body,
      isJson,
    }

    // Raw Fetch Request/Response
    // -------------------------------

    _res.raw = {
      req: _request,
      url: url.toString(),
    }
    // Do not send original Response if asked to Avoid Plain Object
    if (!avoidNonPlainObject) {
      _res.raw.res = _response;
    }

    // Summarise content
    if (isJson) {

      //
      // @TODO: Remove this here,
      //  Instead create an componsed helper fetchRpcApi
      //
      // JSON RPC
      // if (_body.jsonrpc) {
      //   _res.data = _body?.result;
      //   if (_body?.error) {
      //     // err: 'ERR_API' will probably be overrided by JSON RPC Error code:
      //     const { code, ...restErr } = _body?.error || {};
      //     _res.error = createFetchApiError({ name: 'API Error', code: `ERR_API`, status: 200, ...restErr, rpcCode: code }, avoidNonPlainObject)
      //   }
      // }
      // else {
      //   _res.data = _body; // For classic Rest call
      // }

      _res.data = _body;
    }

    else {
      _res.data = _body; // Text value
    }

    _res = {
      ..._res,
      status: _res.data?.status || _response.status,
    };


    // ==============================
    //  Debug
    // ==============================
    // Make a BullSettings to possibly console log fetch
    //
    //
    //

    console.log(`========================= Fetch [${_url}] =========================`)
    console.log(_res)
    console.log(`==========================================================================`)

    // ==============================
    //  Final return
    // ==============================


    return propagateAndReturn(_res);
  }
  catch (e: any) {
    // Sucessfull (200) but something append
    //   Probably `fetch` who cannot make it works fine...
    return propagateAndReturn(catchError(_res, e, 200, avoidNonPlainObject));
  }
}

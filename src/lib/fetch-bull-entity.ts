

//
// Bull Bitcoin API Fetch Entity
// =============================
//
// Wrapper around fetchBull to make special call to retrieve Element
//

import { FetchBullEndpointType, FetchBullProps, FetchBullReturn, FetchRpcEndpointType, GeneralObject, ObjectKeyType, fetchBull } from "..";



// -------------------- (Legacy) Types --------------------

// API Bull Entity Return {element}
//  => @TODO V3.x => Rename it to { entity } - See EntityOf<EntityType> (~/types/entity.ts)
//  -> Keep `ElementOf` to make it easier to search/replace later (but try to use as little as possible)
export type ElementOf<EntityType = any> = {
  element: EntityType
}

// -------------------- Types --------------------

// Not fetchBull props for fetchBull.params (next to {service, method, ...})
export type FetchBullEntityParamsType = GeneralObject | null; // Alias FetchBullParamsType

// FetchBullEntityResultType does not need to exists
//    because Result is EntityType
// export type FetchBullEntityResultType = any // EntityType // Alias FetchBullResultType; (any)



// FetchBull Endpoint Type
// ----------------------

// BullEndpoint are defined the same way as RpcEndpoint
//    (by setuping req:{params: ParamsType} and res: {result: ResultType})


// @TODO: Add another `FetchBullEntityAdditionalResultType` in case {element} is not the only thing returned ??
export type FetchBullEntityEndpointType<EntityType = any, ParamsType extends FetchBullEntityParamsType = any, IncludeType extends ObjectKeyType = string> =
  // FetchRpcEndpointType<ParamsType, ElementOf<EntityType>>
  {
    ParamsType: FetchRpcEndpointType<ParamsType, ElementOf<EntityType>>['ParamsType'],
    IncludeType: IncludeType,
    EntityType: EntityType,
  }




// Convert BullEntity to Bull
// --------------------------
// How to use fetchBull with BullEntity type definition
//
// Convert bull entity endpoint (params,entity) as Bull endpoint (params,result)
// Make possible to re-use type defined for fetchBullEntity with fetchBull (or even fetchApi by converting again)



// Alias (no conversion needed) -
//  BullEntity Params do not need to be updated to be used as Bull Params
export type ConvertBullEntityToBullParamsType<ParamsType extends FetchBullEntityParamsType = any, IncludeType extends ObjectKeyType = string> =
  ParamsType & { includes?: IncludeType[] };

// Alias (no conversion needed)
//    Bull result do not need to be updated to be used as BullEntity result (only the `BullEntityReturn` is updated to add {entity} on the root of the return)
export type ConvertBullResultToBullEntityType<EntityType = any> = ElementOf<EntityType>;



export type ConvertBullEntityToBullEndpointType<BullEntityEndpointType extends FetchBullEntityEndpointType = FetchBullEntityEndpointType> =
  FetchBullEndpointType<
    ConvertBullEntityToBullParamsType<BullEntityEndpointType['ParamsType'], BullEntityEndpointType['IncludeType']>,
    ConvertBullResultToBullEntityType<BullEntityEndpointType['EntityType']>
  >


// FetchBullEntity Props/Return Type
// ---------------------------------
// What props await fetchBullEntity and that's returned by fetchBullEntity

// Alias (props are handled the same way between fetchBull and fetchBullEntity)
export type FetchBullEntityProps<BullEntityEndpointType extends FetchBullEntityEndpointType = FetchBullEntityEndpointType> =
  FetchBullProps<ConvertBullEntityToBullEndpointType<BullEntityEndpointType>>

export type FetchBullEntityReturn<BullEntityEndpointType extends FetchBullEntityEndpointType = FetchBullEntityEndpointType> =

  // Remove data field on fetchBullEntity type
  // now `entity` is easier to use thn `{data.entity}
  //
  // @TODO: In case we want to add additional `FetchBullEntityAdditionalResultType` keep `{data}`
  Omit<
    FetchBullReturn<ConvertBullEntityToBullEndpointType<BullEntityEndpointType>>
    , 'data'
  >
  & {
    entity: BullEntityEndpointType['EntityType'],
  }



// Convert Props/Return Function
// -----------------------------
//  Convert BullEntity Props to Bull Props
//    (so fetchBullEntity can use fetchBull, or any implementation of fetchApi by converting down fetchBull => fetchRpc => fetchApi)


// No conversion (only types)
export const convertBullEntityToBullProps = <BullEntityEndpointType extends FetchBullEntityEndpointType = FetchBullEntityEndpointType>(
  props: FetchBullEntityProps<BullEntityEndpointType>
): FetchBullProps<ConvertBullEntityToBullEndpointType<BullEntityEndpointType>> => {
  return props;
}


// Convert to transform {data:{element: EntityType}} into {entity: EntityType}
export const convertBullToBullEntityReturn = <BullEntityEndpointType extends FetchBullEntityEndpointType = FetchBullEntityEndpointType>(
  { status, data, ...apiReturn }: FetchBullReturn<ConvertBullEntityToBullEndpointType<BullEntityEndpointType>>
): FetchBullEntityReturn<BullEntityEndpointType> => ({

  // Rewrite sorted
  status,
  entity: data.element || {},
  // data,
  ...apiReturn,

});



// FetchBullEntity Function
// ------------------------

// Propose a function to direclty call a BullEntity Endpoint using a single function

// Define the type of the function (to be reused to create helper per endpoint)
export type FetchBullEntityType<BullEntityEndpointType extends FetchBullEntityEndpointType = FetchBullEntityEndpointType> = (
  props: FetchBullEntityProps<BullEntityEndpointType>
) => Promise<FetchBullEntityReturn<BullEntityEndpointType>>


export async function fetchBullEntity<BullEntityEndpointType extends FetchBullEntityEndpointType = FetchBullEntityEndpointType>(
  bullEntityProps: FetchBullEntityProps<BullEntityEndpointType>
): Promise<FetchBullEntityReturn<BullEntityEndpointType>> {

  // Convert props to works with fetchRpc
  const res = await fetchBull(convertBullEntityToBullProps(bullEntityProps));

  // We receive an RpcReturn and want to convert it as a BullReturn
  return convertBullToBullEntityReturn(res);
}



// CreateBullEntityEndpoint
// ------------------------
// Helper to generate easy to use typed function
//    where only params are requested

//
// Define the type
//
//
// Version without props {service, method} to create helper for every endpoint
export type CreateBullEntityEndpointType<BullEntityEndpointType extends FetchBullEntityEndpointType = FetchBullEntityEndpointType> = (
  // First function props is only {params}
  params: FetchBullEntityProps<BullEntityEndpointType>['params'],
  // Allow to send every fetch rpc props
  props?: Partial<FetchBullEntityProps<BullEntityEndpointType>>
) => Promise<FetchBullEntityReturn<BullEntityEndpointType>>


// Usage:
// ------
// type GetGroupEndpointType = FetchBullEndpointType<
//   GroupType,
//   { groupCode: string },
//   'permissions' | 'foo' | 'bar'
// >
// const getGroup: CreateBullEntityEndpointType<GetGroupEndpointType> = async (params, props = {}) => {
//   return await fetchBull({
//     service: 'permissions',
//     method: 'getGroup',
//     ...props,
//     params: { ...props.params, ...params, },
//   })
// }
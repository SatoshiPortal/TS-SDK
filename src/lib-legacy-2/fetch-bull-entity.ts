

//
// Bull Bitcoin API Fetch Entity
// =============================
//
// Wrapper around fetchBull to make special call to retrieve Element
//

import { AdditionalFields, EntityOf, GeneralObject, ObjectKeyType, } from "../types";
import { FetchBullEndpointType, FetchBullProps, FetchBullReturn, fetchBull } from '.'

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


//
// Endpoint is THE way to store all different fields defining a type of BullEndpoint
// Tell yourselft that it is this function which allows you to create the object of type
//
//
// Put all specifics things here so:
//   -> We can pass all thing defining an endpoint with a single Type
//   -> Direclty merging here all rep/res props do not allow us to specificly talk about one part
//        Example: We could regroup all `ParamsType + IncludeType + AdditionalResultType` into a single ReqProps but we cannot extract one part anymore
export type FetchBullEntityEndpointType<
  EntityType = any,
  ParamsType extends FetchBullEntityParamsType = any,
  IncludeType extends ObjectKeyType = string,
  AdditionalResultType extends AdditionalFields = any,
  IsParamsOptional extends boolean = boolean
> =
  {
    ParamsType: ParamsType,
    IncludeType: IncludeType,
    EntityType: EntityType,
    AdditionalResultType: AdditionalResultType,
    IsParamsOptional: IsParamsOptional
  }




// Convert BullEntity to Bull
// --------------------------
// How to use fetchBull with BullEntity type definition
//
// Convert bull entity endpoint (params,entity) as Bull endpoint (params,result)
// Make possible to re-use type defined for fetchBullEntity with fetchBull (or even fetchApi by converting again)



// Alias (no conversion needed) -
//  BullEntity Params do not need to be updated to be used as Bull Params
export type ConvertBullEntityEndpointToBullParamsType<BullEntityEndpointType extends FetchBullEntityEndpointType = FetchBullEntityEndpointType> =
  BullEntityEndpointType['ParamsType']
  & {
    includes?: BullEntityEndpointType['IncludeType'][]
  }


// Alias (no conversion needed)
//    Bull result do not need to be updated to be used as BullEntity result (only the `BullEntityReturn` is updated to add {entity} on the root of the return)
export type ConvertBullEntityEndpointToBullResultType<BullEntityEndpointType extends FetchBullEntityEndpointType = FetchBullEntityEndpointType> =
  ElementOf<BullEntityEndpointType['EntityType']>
  & BullEntityEndpointType['AdditionalResultType'];



export type ConvertBullEntityToBullEndpointType<BullEntityEndpointType extends FetchBullEntityEndpointType = FetchBullEntityEndpointType> =
  FetchBullEndpointType<
    ConvertBullEntityEndpointToBullParamsType<BullEntityEndpointType>,
    ConvertBullEntityEndpointToBullResultType<BullEntityEndpointType>,
    BullEntityEndpointType['IsParamsOptional']
  >


// FetchBullEntity Props/Return Type
// ---------------------------------
// What props await fetchBullEntity and that's returned by fetchBullEntity

// Alias (props are handled the same way between fetchBull and fetchBullEntity)
export type FetchBullEntityProps<BullEntityEndpointType extends FetchBullEntityEndpointType = FetchBullEntityEndpointType> =
  FetchBullProps<ConvertBullEntityToBullEndpointType<BullEntityEndpointType>>



export type FetchBullEntityReturn<BullEntityEndpointType extends FetchBullEntityEndpointType = FetchBullEntityEndpointType> =

  // ===== OPTION 1 (all on root) =====
  // Remove data field on fetchBullEntity type
  // now `entity` is easier to use on root of `res` than `res.data.entity`
  //
  // @TODO: Also move `AdditionalResultType` in root of the request.
  //  /!\ Can cause conflict with other fetch fields :/    !!!
  // -------

  // Omit<
  //   FetchBullReturn<ConvertBullEntityToBullEndpointType<BullEntityEndpointType>>
  //   , 'data'
  // >
  // & EntityOf<BullEntityEndpointType['EntityType']> // {entity: BullEntityEndpointType['EntityType']}
  // & BullEntityEndpointType['AdditionalResultType']

  // ===== OPTION 2 (safer) =====
  // Only duplicate `res.data.entity` into something more usable `res.entity`
  //  But keep original {data} to access `AdditionalResultType` and avoid possible conflict with other fetch fields
  // -------

  FetchBullReturn<ConvertBullEntityToBullEndpointType<BullEntityEndpointType>> // Contain {data: {entity, ...additionalFields}}
  & EntityOf<BullEntityEndpointType['EntityType']> // Only duplicate here: {entity: BullEntityEndpointType['EntityType']}


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
  { status, data: { entity, additionalData }, ...apiReturn }: FetchBullReturn<ConvertBullEntityToBullEndpointType<BullEntityEndpointType>>
): FetchBullEntityReturn<BullEntityEndpointType> => {


  // Rewrite sorted
  return {

    // See FetchBullEntityReturn for more about OPTION 1 & 2

    // ===== OPTION 1 =====
    // Remove {data} field on fetchBullEntity type
    // status,
    // entity: entity || {},
    // ...additionalData,
    // ...apiReturn,

    // ===== OPTION 2 =====
    // Only duplicate `res.data.entity` into something more usable `res.entity`
    status,
    data: { entity, ...additionalData, },
    entity: entity || {},
    ...apiReturn,

  };
}



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


type GroupType = {
  // groupId: number, // To be replaced by groupCode:
  groupCode: string,
  description: string,
  isPublic: boolean,
  isArchived: boolean,
}

type GetGroupEndpointType = FetchBullEntityEndpointType<
  GroupType,
  { groupCode: string },
  'permissions',
  { foo: GroupType }
>

const getGroup: CreateBullEntityEndpointType<GetGroupEndpointType> = async (params, props = {}) => {
  return await fetchBullEntity({
    service: 'permissions',
    method: 'getGroup',
    ...props,
    params: { ...props.params, ...params, },
  })
}

const fn = async () => {
  const res = await getGroup({
    groupCode: 'Foo'
  })
}

// ------------ OPTIONAL PARAMS

// type GetGroupOptionalParamsEndpointType = FetchBullEntityEndpointType<
//   GroupType,
//   null,
//   'permissions',
//   { foo: GroupType },
//   false
// >

// const getGroupOptionalParams: CreateBullEntityEndpointType<GetGroupOptionalParamsEndpointType> = async (params, props = {}) => {
//   return await fetchBullEntity({
//     service: 'permissions',
//     method: 'getGroup',
//     ...props,
//     params: { ...(props.params ? props.params : {}), ...(params || {}), },
//   })
// }

// const fnOPtionalParams = async () => {
//   const res = await getGroupOptionalParams()
// }

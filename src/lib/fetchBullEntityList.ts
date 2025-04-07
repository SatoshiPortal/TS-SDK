

//
// Bull Bitcoin API Fetch Entity List
// ==================================
//
// Wrapper around fetchBull to make special call to retrieve a list of Element
//

import { EntityListQueryType, ObjectKeyType, AdditionalFields, EntityListOf } from "../types"
import { FetchBullEndpointType, FetchBullProps, FetchBullReturn, fetchBull } from '.'

// -------------------- (Legacy) Types --------------------

// API Bull Entity List Return {elements, totalElements}
//  => @TODO V3.x => Rename it to { entities, totalEntities } - See EntityListOf<EntityType> (~/types/entity-list.ts)
//  -> Keep `ElementListOf` to make it easier to search/replace later (but try to use as little as possible)

export type ElementListOf<EntityType = any> = {
  elements: EntityType[],
  totalElements: number,
}

// -------------------- Types --------------------

// No Need for type to define EntityListEndpoint cause
//  * req extends from EntityListQueryType
//  * res is EntityType (extends from any)


// FetchBullEntityList Endpoint Type
// ---------------------------------

// BullEndpoint are defined the same way as RpcEndpoint
//    (by setuping req:{params: ParamsType} and res: {result: ResultType})


// @TODO: Add additional
//    * `FetchBullEntityListAdditionalParamsType`  in case {filters, sortBy, paginator} is not the only thing requested ??
//    * `FetchBullEntityListAdditionalResultType`  in case {elements, totalElements} is not the only thing returned ??
export type FetchBullEntityListEndpointType<
  EntityType = any,
  QueryType extends EntityListQueryType = EntityListQueryType,
  // IncludeType extends ObjectKeyType = string,
  AdditionalParamsType extends AdditionalFields = AdditionalFields,
  AdditionalResultType extends AdditionalFields = AdditionalFields,

> =
  {
    EntityType: EntityType,
    QueryType: QueryType, // {filters, sortBy, paginator}
    // IncludeType: IncludeType, // Partial if not defined ?!
    AdditionalParamsType: AdditionalParamsType,
    AdditionalResultType: AdditionalResultType,
  }


// Convert BullEntityList to Bull
// ------------------------------

// How to use fetchBull with BullEntityList type definition
//
// Convert bull entity list endpoint (entityListQuery, entity) as Bull endpoint (params,result)
// Make possible to re-use type defined for fetchBullEntityList with fetchBull (or even fetchApi by converting again)



// Alias (no conversion needed) -
//  BullEntityList Params do not need to be updated to be used as Bull Params
//  (Maybe add additional props `FetchBullEntityListAdditionalParamsType`)
export type ConvertBullEntityListEndpointToBullParamsType<BullEntityListEndpointType extends FetchBullEntityListEndpointType = FetchBullEntityListEndpointType> =
  BullEntityListEndpointType['QueryType']
  // (@@Search-IncludeType)
  // & {
  //   includes?: BullEntityListEndpointType['IncludeType'][]
  // }
  & BullEntityListEndpointType['AdditionalParamsType'];


// Alias (no conversion needed)
//    Bull result do not need to be updated to be used as BullEntity result (only the `BullEntityReturn` is updated to add {entity} on the root of the return)
//   (Maybe add additional props `FetchBullEntityListAdditionalParamsType`)
export type ConvertBullListEntitiedEndpointToBullResultType<BullEntityListEndpointType extends FetchBullEntityListEndpointType = FetchBullEntityListEndpointType> =
  ElementListOf<BullEntityListEndpointType['EntityType']>
  & BullEntityListEndpointType['AdditionalResultType'];


export type ConvertBullEntityListToBullEndpointType<BullEntityListEndpointType extends FetchBullEntityListEndpointType = FetchBullEntityListEndpointType> =
  FetchBullEndpointType<
    ConvertBullEntityListEndpointToBullParamsType<BullEntityListEndpointType>,
    ConvertBullListEntitiedEndpointToBullResultType<BullEntityListEndpointType>
  >








// FetchBullEntityList Props/Return Type
// -------------------------------------
// What props await fetchBullEntityList and that's returned by fetchBullEntityList



// Alias (props are handled the same way between fetchBull and fetchBullEntityList)
//    Who receive {filters, sortBy, paginator} into {params} and directly used it as bull.params
export type FetchBullEntityListProps<BullEntityListEndpointType extends FetchBullEntityListEndpointType = FetchBullEntityListEndpointType> =
  FetchBullProps<ConvertBullEntityListToBullEndpointType<BullEntityListEndpointType>>;




export type FetchBullEntityListReturn<BullEntityListEndpointType extends FetchBullEntityListEndpointType = FetchBullEntityListEndpointType> =

  // ===== OPTION 1 (all on root) =====
  // Remove data field on fetchBullEntityList type
  // now `entities` is easier to use on root of `res` than `res.data.entities`
  //
  // @TODO: Also move `AdditionalResultType` in root of the request.
  //  /!\ Can cause conflict with other fetch fields :/    !!!
  // -------


  // Omit<
  //   FetchBullReturn<ConvertBullEntityListToBullEndpointType<BullEntityListEndpointType>>
  //   , 'data'
  // >
  // // {entities: BullEntityListEndpointType['EntityType'][], totalEntities: number}
  // & EntityListOf<BullEntityListEndpointType['EntityType']>
  // & BullEntityListEndpointType['AdditionalResultType']


  // ===== OPTION 2 (safer) =====
  // Only duplicate `res.data.entites/totalEntities` into something more usable `res.entities/res.totalEntities`
  //  But keep original {data} to access `AdditionalResultType` and avoid possible conflict with other fetch fields
  // -------

  FetchBullReturn<ConvertBullEntityListToBullEndpointType<BullEntityListEndpointType>>
  // Duplicate {entities: BullEntityListEndpointType['EntityType'][], totalEntities: number}
  & EntityListOf<BullEntityListEndpointType['EntityType']>




// Convert Props/Return Function
// -----------------------------
//  Convert BullEntityList Props to Bull Props
//    (so fetchBullEntityList can use fetchBull, or any implementation of fetchApi by converting down fetchBull => fetchRpc => fetchApi)

// No conversion (only types)
export const convertBullEntityListToBullProps = <BullEntityListEndpointType extends FetchBullEntityListEndpointType = FetchBullEntityListEndpointType>(
  props: FetchBullEntityListProps<BullEntityListEndpointType>
): FetchBullProps<ConvertBullEntityListToBullEndpointType<BullEntityListEndpointType>> => {
  return props;
}


// Convert to transform {data:{elements: EntityType, totalElements:number}} into {entities: EntityType, totalEntities:number}
export const convertBullToBullEntityListReturn = <BullEntityListEndpointType extends FetchBullEntityListEndpointType = FetchBullEntityListEndpointType>(
  { status, data: { entities, totalEntities, ...additionalData }, ...apiReturn }: FetchBullReturn<ConvertBullEntityListToBullEndpointType<BullEntityListEndpointType>>
): FetchBullEntityListReturn<BullEntityListEndpointType> => {


  // Rewrite sorted
  return {

    // See FetchBullEntityListReturn for more about OPTION 1 & 2

    // ===== OPTION 1 =====
    // Remove {data} field on fetchBullEntityList type
    // status,
    // entities: entities || [],
    // totalEntities,
    // ...additionalData,
    // ...apiReturn,

    // ===== OPTION 2 =====
    // Only duplicate `res.data.entity` into something more usable `res.entity`
    status,
    data: { entities, totalEntities, ...additionalData, },
    entities: entities || [],
    totalEntities,
    ...apiReturn,

  };

};






// FetchBullEntityList Function
// ----------------------------

// Propose a function to direclty call a BullEntityList Endpoint using a single function
// Define the type of the function (to be reused to create helper per endpoint)
export type FetchBullEntityListType<BullEntityListEndpointType extends FetchBullEntityListEndpointType = FetchBullEntityListEndpointType> = (
  props: FetchBullEntityListProps<BullEntityListEndpointType>
) => Promise<FetchBullEntityListReturn<BullEntityListEndpointType>>


export async function fetchBullEntityList<BullEntityListEndpointType extends FetchBullEntityListEndpointType = FetchBullEntityListEndpointType>(
  bullEntityListProps: FetchBullEntityListProps<BullEntityListEndpointType>
): Promise<FetchBullEntityListReturn<BullEntityListEndpointType>> {

  // Convert props to works with fetchRpc
  const res = await fetchBull(convertBullEntityListToBullProps(bullEntityListProps));

  // We receive an RpcReturn and want to convert it as a BullReturn
  return convertBullToBullEntityListReturn(res);
}



// CreateBullEntityListEndpoint
// -----------------------------
// Helper to generate easy to use typed function
//    where only params are requested

//
// Define the type
//
//
// Version without props {service, method} to create helper for every endpoint
// export type CreateBullEntityListEndpointType<BullEntityListEndpointType extends FetchBullEntityListEndpointType = FetchBullEntityListEndpointType> =
//   IsOptional<FetchBullEntityListProps<BullEntityListEndpointType>['params']> extends true
//   ? (
//     // First function props is only {params}
//     //  => List have partial params cause all fields under it are optional (see IsOptional) => mean AdditionlParamsType is empty or only composed of optional fields
//     params?: FetchBullEntityListProps<BullEntityListEndpointType>['params'],
//     // Allow to send every fetch rpc props
//     props?: Partial<FetchBullEntityListProps<BullEntityListEndpointType>>
//   ) => Promise<FetchBullEntityListReturn<BullEntityListEndpointType>>
//   : (
//     // First function props is only {params}
//     //  => List have partial params cause all fields under it are optional (see IsOptional) => mean AdditionlParamsType contains non-optional fields
//     params: FetchBullEntityListProps<BullEntityListEndpointType>['params'],
//     // Allow to send every fetch rpc props
//     props?: Partial<FetchBullEntityListProps<BullEntityListEndpointType>>
//   ) => Promise<FetchBullEntityListReturn<BullEntityListEndpointType>>

export type CreateBullEntityListEndpointType<BullEntityListEndpointType extends FetchBullEntityListEndpointType = FetchBullEntityListEndpointType> = (
  // First function props is only {params}
  //  => List have partial params cause all fields under it are optional (see IsOptional) => mean AdditionlParamsType contains non-optional fields
  params: FetchBullEntityListProps<BullEntityListEndpointType>['params'],
  // Allow to send every fetch rpc props
  props?: Partial<FetchBullEntityListProps<BullEntityListEndpointType>>
) => Promise<FetchBullEntityListReturn<BullEntityListEndpointType>>



// Usage
// ====================
//
// type GroupSortByIdType = 'groupCode' | 'description'
// type GroupFiltersType = {
//   // search?: string,
//   isPublic?: boolean,
//   isArchived?: boolean,
// }
//
// type ListGroupsEndpointType = FetchBullEntityListEndpointType<
//   GroupType,
//   EntityListQueryType<GroupFiltersType, GroupSortByIdType>,
//   'permissions'
// >
//
// const listGroups: CreateBullEntityListEndpointType<ListGroupsEndpointType> = async (params, props = {}) => {
//   return await fetchBullEntityList<ListGroupsEndpointType>({
//     service: 'permissions',
//     method: 'listGroups',
//     ...props,
//     params: { ...props.params, ...params, },
//   })
// }



// type GroupSortByIdType = 'groupCode' | 'description'
// type GroupFiltersType = {
//   isPublic?: boolean,
//   isArchived?: boolean,
// }
// type GroupType = {
//   // groupId: number, // To be replaced by groupCode:
//   groupCode: string,
//   description: string,
//   isPublic: boolean,
//   isArchived: boolean,
// }

// type ListGroupsEndpointType = FetchBullEntityListEndpointType<
//   GroupType,
//   EntityListQueryType<GroupFiltersType, GroupSortByIdType>,
//   { foo: string, bar?: string },
//   { fooo: string, baaar: string }
// >


// // const listGroups: CreateBullEntityListEndpointType<ListGroupsEndpointType> = async (params, props = {}) => {
// //   return await fetchBullEntityList<ListGroupsEndpointType>({
// //     service: 'permissions',
// //     method: 'listGroups',
// //     ...props,
// //     // params,
// //     params: { ...props.params, ...params },
// //   })
// // }
// const listGroups: CreateBullEntityListEndpointType<ListGroupsEndpointType> = async (
//   params, // params ici doit maintenant inclure explicitement les champs de AdditionalParamsType
//   props = {}
// ) => {
//   // Ici, on assume que params inclut déjà tous les champs nécessaires,
//   // y compris `foo`, en raison de la façon dont le type de `params` est défini.
//   return await fetchBullEntityList<ListGroupsEndpointType>({
//     service: 'permissions',
//     method: 'listGroups',
//     ...props,
//     params: { ...props.params, ...params }, // `params` fourni par l'utilisateur doit déjà respecter le contrat de type
//   });
// }


// // listGroups({ foo: 'Yes' })
// // listGroups()

// // fetchBullEntityList<ListGroupsEndpointType>({
// //   service: 'permissions',
// //   method: 'listGroups',
// // })
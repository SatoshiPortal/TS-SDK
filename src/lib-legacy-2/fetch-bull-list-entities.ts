
//
// Bull Bitcoin API Fetch Entity List
// ==================================
//
// Wrapper around fetchBull to make special call to retrieve a list of Element
//

import { ListEntitiesQueryType, ObjectKeyType, AdditionalFields, ListEntitiesOf } from "../types"
import { FetchBullEndpointType, FetchBullProps, FetchBullReturn, fetchBull } from '.'

// -------------------- (Legacy) Types --------------------

// API Bull Entity List Return {elements, totalElements}
//  => @TODO V3.x => Rename it to { entities, totalEntities } - See ListEntitiesOf<EntityType> (~/types/entity-list.ts)
//  -> Keep `ElementListOf` to make it easier to search/replace later (but try to use as little as possible)

export type ElementListOf<EntityType = any> = {
  elements: EntityType[],
  totalElements: number,
}

// -------------------- Types --------------------

// No Need for type to define ListEntitiesEndpoint cause
//  * req extends from ListEntitiesQueryType
//  * res is EntityType (extends from any)


// FetchBullListEntities Endpoint Type
// ---------------------------------

// BullEndpoint are defined the same way as RpcEndpoint
//    (by setuping req:{params: ParamsType} and res: {result: ResultType})


// @TODO: Add additional
//    * `FetchBullListEntitiesAdditionalParamsType`  in case {filters, sortBy, paginator} is not the only thing requested ??
//    * `FetchBullListEntitiesAdditionalResultType`  in case {elements, totalElements} is not the only thing returned ??
export type FetchBullListEntitiesEndpointType<
  EntityType = any,
  QueryType extends ListEntitiesQueryType = ListEntitiesQueryType,
  IncludeType extends ObjectKeyType = string,
  AdditionalParamsType extends AdditionalFields = any,
  AdditionalResultType extends AdditionalFields = any,
  IsParamsOptional extends boolean = boolean

> =
  {
    EntityType: EntityType,
    QueryType: QueryType, // {filters, sortBy, paginator}
    IncludeType: IncludeType, // Partial if not defined ?!
    AdditionalParamsType: AdditionalParamsType,
    AdditionalResultType: AdditionalResultType,
    IsParamsOptional: IsParamsOptional,
  }


// Convert BullListEntities to Bull
// ------------------------------

// How to use fetchBull with BullListEntities type definition
//
// Convert bull entity list endpoint (entityListQuery, entity) as Bull endpoint (params,result)
// Make possible to re-use type defined for fetchBullListEntities with fetchBull (or even fetchApi by converting again)



// Alias (no conversion needed) -
//  BullListEntities Params do not need to be updated to be used as Bull Params
//  (Maybe add additional props `FetchBullListEntitiesAdditionalParamsType`)
export type ConvertBullListEntitiesEndpointToBullParamsType<BullListEntitiesEndpointType extends FetchBullListEntitiesEndpointType = FetchBullListEntitiesEndpointType> =
  BullListEntitiesEndpointType['QueryType']
  & {
    includes?: BullListEntitiesEndpointType['IncludeType'][]
  }
  & BullListEntitiesEndpointType['AdditionalParamsType'];


// Alias (no conversion needed)
//    Bull result do not need to be updated to be used as BullEntity result (only the `BullEntityReturn` is updated to add {entity} on the root of the return)
//   (Maybe add additional props `FetchBullListEntitiesAdditionalParamsType`)
export type ConvertBullListEntitiedEndpointToBullResultType<BullListEntitiesEndpointType extends FetchBullListEntitiesEndpointType = FetchBullListEntitiesEndpointType> =
  ElementListOf<BullListEntitiesEndpointType['EntityType']>
  & BullListEntitiesEndpointType['AdditionalResultType'];


export type ConvertBullListEntitiesToBullEndpointType<BullListEntitiesEndpointType extends FetchBullListEntitiesEndpointType = FetchBullListEntitiesEndpointType> =
  FetchBullEndpointType<
    ConvertBullListEntitiesEndpointToBullParamsType<BullListEntitiesEndpointType>,
    ConvertBullListEntitiedEndpointToBullResultType<BullListEntitiesEndpointType>,
    BullListEntitiesEndpointType['IsParamsOptional']
  >








// FetchBullListEntities Props/Return Type
// -------------------------------------
// What props await fetchBullListEntities and that's returned by fetchBullListEntities



// Alias (props are handled the same way between fetchBull and fetchBullListEntities)
//    Who receive {filters, sortBy, paginator} into {params} and directly used it as bull.params
export type FetchBullListEntitiesProps<BullListEntitiesEndpointType extends FetchBullListEntitiesEndpointType = FetchBullListEntitiesEndpointType> =
  FetchBullProps<ConvertBullListEntitiesToBullEndpointType<BullListEntitiesEndpointType>>;




export type FetchBullListEntitiesReturn<BullListEntitiesEndpointType extends FetchBullListEntitiesEndpointType = FetchBullListEntitiesEndpointType> =

  // ===== OPTION 1 (all on root) =====
  // Remove data field on fetchBullListEntities type
  // now `entities` is easier to use on root of `res` than `res.data.entities`
  //
  // @TODO: Also move `AdditionalResultType` in root of the request.
  //  /!\ Can cause conflict with other fetch fields :/    !!!
  // -------


  // Omit<
  //   FetchBullReturn<ConvertBullListEntitiesToBullEndpointType<BullListEntitiesEndpointType>>
  //   , 'data'
  // >
  // // {entities: BullListEntitiesEndpointType['EntityType'][], totalEntities: number}
  // & ListEntitiesOf<BullListEntitiesEndpointType['EntityType']>
  // & BullListEntitiesEndpointType['AdditionalResultType']


  // ===== OPTION 2 (safer) =====
  // Only duplicate `res.data.entites/totalEntities` into something more usable `res.entities/res.totalEntities`
  //  But keep original {data} to access `AdditionalResultType` and avoid possible conflict with other fetch fields
  // -------

  FetchBullReturn<ConvertBullListEntitiesToBullEndpointType<BullListEntitiesEndpointType>>
  // Duplicate {entities: BullListEntitiesEndpointType['EntityType'][], totalEntities: number}
  & ListEntitiesOf<BullListEntitiesEndpointType['EntityType']>




// Convert Props/Return Function
// -----------------------------
//  Convert BullListEntities Props to Bull Props
//    (so fetchBullListEntities can use fetchBull, or any implementation of fetchApi by converting down fetchBull => fetchRpc => fetchApi)

// No conversion (only types)
export const convertBullListEntitiesToBullProps = <BullListEntitiesEndpointType extends FetchBullListEntitiesEndpointType = FetchBullListEntitiesEndpointType>(
  props: FetchBullListEntitiesProps<BullListEntitiesEndpointType>
): FetchBullProps<ConvertBullListEntitiesToBullEndpointType<BullListEntitiesEndpointType>> => {
  return props;
}


// Convert to transform {data:{elements: EntityType, totalElements:number}} into {entities: EntityType, totalEntities:number}
export const convertBullToBullListEntitiesReturn = <BullListEntitiesEndpointType extends FetchBullListEntitiesEndpointType = FetchBullListEntitiesEndpointType>(
  { status, data: { entities, totalEntities, additionalData }, ...apiReturn }: FetchBullReturn<ConvertBullListEntitiesToBullEndpointType<BullListEntitiesEndpointType>>
): FetchBullListEntitiesReturn<BullListEntitiesEndpointType> => {


  // Rewrite sorted
  return {

    // See FetchBullListEntitiesReturn for more about OPTION 1 & 2

    // ===== OPTION 1 =====
    // Remove {data} field on fetchBullListEntities type
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






// FetchBullListEntities Function
// ----------------------------

// Propose a function to direclty call a BullListEntities Endpoint using a single function

// Define the type of the function (to be reused to create helper per endpoint)
export type FetchBullListEntitiesType<BullListEntitiesEndpointType extends FetchBullListEntitiesEndpointType = FetchBullListEntitiesEndpointType> = (
  props: FetchBullListEntitiesProps<BullListEntitiesEndpointType>
) => Promise<FetchBullListEntitiesReturn<BullListEntitiesEndpointType>>


export async function fetchBullListEntities<BullListEntitiesEndpointType extends FetchBullListEntitiesEndpointType = FetchBullListEntitiesEndpointType>(
  bullListEntitiesProps: FetchBullListEntitiesProps<BullListEntitiesEndpointType>
): Promise<FetchBullListEntitiesReturn<BullListEntitiesEndpointType>> {

  // Convert props to works with fetchRpc
  const res = await fetchBull(convertBullListEntitiesToBullProps(bullListEntitiesProps));

  // We receive an RpcReturn and want to convert it as a BullReturn
  return convertBullToBullListEntitiesReturn(res);
}



// CreateBullListEntitiesEndpoint
// -----------------------------
// Helper to generate easy to use typed function
//    where only params are requested

//
// Define the type
//
//
// Version without props {service, method} to create helper for every endpoint
// export type CreateBullListEntitiesEndpointType<BullListEntitiesEndpointType extends FetchBullListEntitiesEndpointType = FetchBullListEntitiesEndpointType> =
//   IsOptional<FetchBullListEntitiesProps<BullListEntitiesEndpointType>['params']> extends true
//   ? (
//     // First function props is only {params}
//     //  => List have partial params cause all fields under it are optional (see IsOptional) => mean AdditionlParamsType is empty or only composed of optional fields
//     params?: FetchBullListEntitiesProps<BullListEntitiesEndpointType>['params'],
//     // Allow to send every fetch rpc props
//     props?: Partial<FetchBullListEntitiesProps<BullListEntitiesEndpointType>>
//   ) => Promise<FetchBullListEntitiesReturn<BullListEntitiesEndpointType>>
//   : (
//     // First function props is only {params}
//     //  => List have partial params cause all fields under it are optional (see IsOptional) => mean AdditionlParamsType contains non-optional fields
//     params: FetchBullListEntitiesProps<BullListEntitiesEndpointType>['params'],
//     // Allow to send every fetch rpc props
//     props?: Partial<FetchBullListEntitiesProps<BullListEntitiesEndpointType>>
//   ) => Promise<FetchBullListEntitiesReturn<BullListEntitiesEndpointType>>

export type CreateBullListEntitiesEndpointType<BullListEntitiesEndpointType extends FetchBullListEntitiesEndpointType = FetchBullListEntitiesEndpointType> = (
  // First function props is only {params}
  //  => List have partial params cause all fields under it are optional (see IsOptional) => mean AdditionlParamsType contains non-optional fields
  params: FetchBullListEntitiesProps<BullListEntitiesEndpointType>['params'],
  // Allow to send every fetch rpc props
  props?: Partial<FetchBullListEntitiesProps<BullListEntitiesEndpointType>>
) => Promise<FetchBullListEntitiesReturn<BullListEntitiesEndpointType>>



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
// type ListGroupsEndpointType = FetchBullListEntitiesEndpointType<
//   GroupType,
//   ListEntitiesQueryType<GroupFiltersType, GroupSortByIdType>,
//   'permissions'
// >
//
// const listGroups: CreateBullListEntitiesEndpointType<ListGroupsEndpointType> = async (params, props = {}) => {
//   return await fetchBullListEntities<ListGroupsEndpointType>({
//     service: 'permissions',
//     method: 'listGroups',
//     ...props,
//     params: { ...props.params, ...params, },
//   })
// }



type GroupSortByIdType = 'groupCode' | 'description'
type GroupFiltersType = {
  isPublic?: boolean,
  isArchived?: boolean,
}
type GroupType = {
  // groupId: number, // To be replaced by groupCode:
  groupCode: string,
  description: string,
  isPublic: boolean,
  isArchived: boolean,
}

type ListGroupsEndpointType = FetchBullListEntitiesEndpointType<
  GroupType,
  ListEntitiesQueryType<GroupFiltersType, GroupSortByIdType>,
  'permissions',
  { foo: string, bar?: string },
  { fooo: string, baaar: string }
>


// const listGroups: CreateBullListEntitiesEndpointType<ListGroupsEndpointType> = async (params, props = {}) => {
//   return await fetchBullListEntities<ListGroupsEndpointType>({
//     service: 'permissions',
//     method: 'listGroups',
//     ...props,
//     // params,
//     params: { ...props.params, ...params },
//   })
// }
const listGroups: CreateBullListEntitiesEndpointType<ListGroupsEndpointType> = async (
  params, // params ici doit maintenant inclure explicitement les champs de AdditionalParamsType
  props = {}
) => {
  // Ici, on assume que params inclut déjà tous les champs nécessaires,
  // y compris `foo`, en raison de la façon dont le type de `params` est défini.
  return await fetchBullListEntities<ListGroupsEndpointType>({
    service: 'permissions',
    method: 'listGroups',
    ...props,
    params: { ...props.params, ...params }, // `params` fourni par l'utilisateur doit déjà respecter le contrat de type
  });
}


// listGroups({ foo: 'Yes' })
// listGroups()

// fetchBullListEntities<ListGroupsEndpointType>({
//   service: 'permissions',
//   method: 'listGroups',
// })
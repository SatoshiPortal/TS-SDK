
//
// Bull Bitcoin API Fetch Entity List
// ==================================
//
// Wrapper around fetchBull to make special call to retrieve a list of Element
//

import { ListEntitiesQueryType, FetchBullEndpointType, FetchBullProps, FetchBullReturn, fetchBull, Optional, ObjectKeyType } from ".."

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
export type FetchBullListEntitiesEndpointType<EntityType = any, QueryType extends ListEntitiesQueryType = ListEntitiesQueryType, IncludeType extends ObjectKeyType = string> =
  {
    EntityType: EntityType,
    QueryType: QueryType, // {filters, sortBy, paginator}
    IncludeType: IncludeType, // Partial if not defined ?!
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
export type ConvertBullListEntitiesToBullParamsType<QueryType extends ListEntitiesQueryType = ListEntitiesQueryType, IncludeType extends ObjectKeyType = string, /*, FetchBullListEntitiesAdditionalParamsType*/> =
  QueryType & { includes?: IncludeType[] };


// Alias (no conversion needed)
//    Bull result do not need to be updated to be used as BullEntity result (only the `BullEntityReturn` is updated to add {entity} on the root of the return)
//   (Maybe add additional props `FetchBullListEntitiesAdditionalParamsType`)
export type ConvertBullResultToBullListEntitiesType<EntityType = any> = ElementListOf<EntityType>;


export type ConvertBullListEntitiesToBullEndpointType<BullListEntitiesEndpointType extends FetchBullListEntitiesEndpointType = FetchBullListEntitiesEndpointType> =
  FetchBullEndpointType<
    ConvertBullListEntitiesToBullParamsType<BullListEntitiesEndpointType['QueryType'], BullListEntitiesEndpointType['IncludeType']>,
    ConvertBullResultToBullListEntitiesType<BullListEntitiesEndpointType['EntityType']>
  >








// FetchBullListEntities Props/Return Type
// -------------------------------------
// What props await fetchBullListEntities and that's returned by fetchBullListEntities



// Alias (props are handled the same way between fetchBull and fetchBullListEntities)
//    Who receive {filters, sortBy, paginator} into {params} and directly used it as bull.params
export type FetchBullListEntitiesProps<BullListEntitiesEndpointType extends FetchBullListEntitiesEndpointType = FetchBullListEntitiesEndpointType> =
  FetchBullProps<ConvertBullListEntitiesToBullEndpointType<BullListEntitiesEndpointType>>;

// @TOFIX:
// Optional<
//   FetchBullProps<ConvertBullListEntitiesToBullEndpointType<BullListEntitiesEndpointType>>
//   , 'params'
// >

export type FetchBullListEntitiesReturn<BullListEntitiesEndpointType extends FetchBullListEntitiesEndpointType = FetchBullListEntitiesEndpointType> =

  // Remove data field on fetchBullListEntities type
  // now `{entities, totalEntities}` in on root and reasier to use than under `data` (res.data.entities)
  //
  // @TODO: In case we want to add additional `FetchBullListEntitiesAdditionalResultType` keep `{data}`
  Omit<
    FetchBullReturn<ConvertBullListEntitiesToBullEndpointType<BullListEntitiesEndpointType>>
    , 'data'
  >
  & {
    entities: BullListEntitiesEndpointType['EntityType'][],
    totalEntities: number,
  }




// Convert Props/Return Function
// -----------------------------
//  Convert BullListEntities Props to Bull Props
//    (so fetchBullListEntities can use fetchBull, or any implementation of fetchApi by converting down fetchBull => fetchRpc => fetchApi)

// No conversion (only types)
export const convertBullListEntitiesToBullProps = <BullListEntitiesEndpointType extends FetchBullListEntitiesEndpointType = FetchBullListEntitiesEndpointType>(
  props: FetchBullListEntitiesProps<BullListEntitiesEndpointType>
  // @TOFIX
  // ): Optional<FetchBullProps<ConvertBullListEntitiesToBullEndpointType<BullListEntitiesEndpointType>>, 'params'> => {
): FetchBullProps<ConvertBullListEntitiesToBullEndpointType<BullListEntitiesEndpointType>> => {
  return props;
}


// Convert to transform {data:{elements: EntityType, totalElements:number}} into {entities: EntityType, totalEntities:number}
export const convertBullToBullListEntitiesReturn = <BullListEntitiesEndpointType extends FetchBullListEntitiesEndpointType = FetchBullListEntitiesEndpointType>(
  { status, data, ...apiReturn }: FetchBullReturn<ConvertBullListEntitiesToBullEndpointType<BullListEntitiesEndpointType>>
): FetchBullListEntitiesReturn<BullListEntitiesEndpointType> => ({

  // Rewrite sorted
  status,
  entities: data.elements || [],
  totalEntities: data.totalElements, // @TODO Must fail ?! (missing thing todo)
  // data,
  ...apiReturn,

});






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
export type CreateBullListEntitiesEndpointType<BullListEntitiesEndpointType extends FetchBullListEntitiesEndpointType = FetchBullListEntitiesEndpointType> = (
  // First function props is only {params}
  // List have partial parms cause all fields under it are optional
  params?: FetchBullListEntitiesProps<BullListEntitiesEndpointType>['params'],
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
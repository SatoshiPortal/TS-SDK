import { GeneralObject, ObjectKeyType } from "../utils";



// Entity List Sub-Types
// =====================

// Possible way to specify sortBy.id vailable
//  Example `SortByType<'userId' | 'userNbr'>` specify that ListEntities can only be sort with thoses key
export type SortByType<SortByIdType extends ObjectKeyType = string> = {
  sort?: 'asc' | 'desc',
  id: SortByIdType,
};


export type PaginatorType = {
  page?: number,
  pageSize?: number,
  // By default pagination is alwadies activated
  //   and preset to paginator: { page:1, pageSize: 10 } by default
  //   set paginator: { avoid:true } to return all results without pagination handled
  avoid?: boolean,
};


// Entity List Props and Return
// ============================

export type ListEntitiesQueryType<FiltersType extends GeneralObject = any, SortByIdType extends ObjectKeyType = string> = {
  filters?: FiltersType,
  sortBy?: SortByType<SortByIdType>,
  paginator?: PaginatorType,
}

//
// 1.Note:
//   Bull ListEntities Endpoint return legacy ElementListOf (DataListOf)
//   -> Only present on Fetch BullListEntities (defined on ~/lib/fetch-bull-entity-list, used only over there and try to avoid it)

//
// 2. @TODO ??
//    Slit this in order to specify if it's only ServerSide (only {entity, totalentity})
//    or ClientSide (and 4 fields are required (not partial))
export type ListEntitiesOf<EntityType = any> = {
  // Processing entities (client-side)

  // @TODO: Comment them to check where it fail
  //  to know where it's used (and maybe who to replace it with something else ?)
  //  unprocessdEntities?: EntityType[],    // All received entities
  //  filteredEntities?: EntityType[],       // Filtered (but not paginated) entities

  entities: EntityType[],
  totalEntities: number,
}


// Entity for Handling Functions
// =============================


// ===== Types for Filters Functions =====

// Type for custom function
export type ListEntitiesFilterProps<E, F = any> = {
  entity: E,
  filters?: F,
};
export type ListEntitiesFilterType<E, F = any> = (props: ListEntitiesFilterProps<E, F>) => boolean;


// ===== Types for Sort Functions =====


export type ListEntitiesSortProps<E> = {
  entityA: E,
  entityB: E,
  sortBy?: SortByType,
};
export type ListEntitiesSortType<E> = (props: ListEntitiesSortProps<E>) => number;

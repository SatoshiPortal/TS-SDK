
//
// Utils Bull Types to handle Entity
// ---------------------------------
//


// -------------------- (Legacy) Types --------------------

// API Bull Entity Return {element}
//    Only present on Fetch BullEntity (defined on ~/lib/fetch-bull-entity, used only over there and try to avoid it)


// -------------------- Types --------------------

// Same as ElementOf but with key {entity} instead of (legacy) {element}
export type EntityOf<EntityType = any> = {
  entity: EntityType
}
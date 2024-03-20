
//
// Utils Types
// ===========
//


export type ObjectKeyType = string | number | symbol
export type EnumType = { [key: string]: string } // Other type will cause issue: "number is not assignable to string" when using t(Enum.Foo)
export type EnumValueType<E> = E[keyof E]

// What the best type for AdditionalFields ?
//  {}              -> Force to be an object, but can also be function, array, function
//  object          -> Force to be an object and not other primitive
//  GeneralObject   -> Global record that allow everything (not type-safe)
export type GeneralObject<Key extends ObjectKeyType = string, Value = any> = Record<Key, Value>;


//
// Utils Functions
// ===============
//

// Partial-like but allow to set optional only a list a field
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>;

// Put everythning Partial (with all deep keys)
export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

// Allow to make a Optional fields under fiew level. Example `DeepOptional<Foo, 'path.to.field'>`
export type DeepOptional<T, Path extends string> = Path extends `${infer First}.${infer Rest}`
  ? { [K in keyof T as K extends First ? K : never]?: DeepOptional<T[K], Rest> } & Omit<T, First>
  : { [K in keyof T as K extends Path ? K : never]?: T[K] } & Omit<T, Path>;


// Allow to put a list of Required fields
export type RequiredField<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Only specified fiekds are required, others are optional
export type RequireOnly<T, K extends keyof T> = RequiredField<Partial<T>, K>

// Record<T,K>-like but keys (K) are all optionals
export type PartialRecord<K extends string | number | symbol, T> = Partial<Record<K, T>>

export type Nullable<T, Fields extends keyof T = keyof T> = {
  [Property in keyof T]: Property extends Fields ? T[Property] | null : T[Property];
};

export type PartialNullable<T, Fields extends keyof T = keyof T> = Partial<Nullable<T, Fields>>;



// --- Tools to IsNeverOrEmptyOrAllOptional ----

// Identifies keys of T that are optional.
export type AllOptionalKeys<T> = {
  // Maps each key of T to itself if its value is optional (can be assigned undefined), otherwise maps to never.
  [K in keyof T]-?: undefined extends T[K] ? K : never
}[keyof T];

// Checks if a type has no keys, meaning it's an empty object.
export type IsEmptyObject<T> = keyof T extends never ? true : false;

// Determines if a type is never, undefined, or null.
export type IsNeverOrEmpty<T> = [T] extends [never] | [undefined] | [null] ? true : false;

// Determines if T is an object with only optional fields.
export type IsObjectWithOnlyOptionalFields<T> = [T] extends [object]
  // First, checks if T is an object. If true, it then checks if the object with all non-optional keys removed is empty.
  ? IsEmptyObject<Pick<T, Exclude<keyof T, AllOptionalKeys<T>>>>
  : false;

// Extends IsNeverOrEmpty to also return true if T is an object with only optional fields.
export type IsNeverOrEmptyOrAllOptional<T> =
  IsNeverOrEmpty<T> extends true ? true :
  // If T is not never, undefined, or null, it then checks if T is an object with only optional fields.
  IsObjectWithOnlyOptionalFields<T> extends true ? true :
  false;





// Use it to decompose complex type (when VisualCode display `A & B & C` and you want to see the list of fields on the final-type)
export type Debug<T> = { [K in keyof T]: T[K] }

// Clean an object to keep only keys present on Type
// export function sanitize<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
//   const copy = {} as Pick<T, K>;
//   keys.forEach(key => copy[key] = obj[key]);
//   return copy;
// }

// Allow to create a Filter object based on the object we want to filters
//  (Do not forget to wrap into FiltersProps<> to make it usable as Filters Component {filters: FooFilters, setFilters:Dispatch<FooFilters>, refresh})
//
// type Foo { foo: string, bar:number, nop: boolean}
// type FooFilters = PickFilterFields<Foo> // {foo?: string || string[], bar?: number || number[], search?: string}
//

export type PickFilterFields<T, K extends keyof T, includeSearch extends boolean = true> = {
  [P in K]?: T[P] | T[P][]
} & (includeSearch extends true ? { search?: string } : {})


//
// Utils Types
// ===========
//


export type ObjectKeyType = string | number | symbol
export type EnumType = { [key: string]: string } // Other type will cause issue: "number is not assignable to string" when using t(Enum.Foo)
export type EnumValueType<E> = E[keyof E]


export type GeneralObject<Key extends ObjectKeyType = string, Value = any> = Record<Key, Value>;


// Allow to extend an object with possible Additional fields (extends AdditionalFields)
//    Usage of `extends any, null, unknow or {}` will cause issue when combined with something else
//    See FetchBullEntity or FetchBullEntitiesList for example of use
//      => If we replace AdditionalFields on a `FetchBullEntityEndpointType` definition and create an Endpoint without any defined `AdditionalResultType`
//          then res.data will be `any` as `EntityType & any` != EntityType (but any)
//          where `EntityType & AdditionalFields => EntityType`
export type AdditionalFields = GeneralObject;


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

// This version also put optional all part of the Path (if path is `foo.bar.xyz` then foo, foo.bar and foo.bar.xyz become optional)
// export type DeepOptional<T, Path extends string> = Path extends `${infer First}.${infer Rest}`
//   ? { [K in keyof T as K extends First ? K : never]?: DeepOptional<T[K], Rest> } & Omit<T, First>
//   : { [K in keyof T as K extends Path ? K : never]?: T[K] } & Omit<T, Path>;

// Usage:
// type MyType = { foo: { bar: string, xyz: string } }
// type MyTypePartialBar = DeepOptional<MyType, 'foo.bar'>
export type DeepOptional<T, Path extends string> = string extends Path
  ? T
  : (Path extends keyof T
    ? Omit<T, Path> & Partial<Pick<T, Path & keyof T>>
    : (Path extends `${infer First}.${infer Rest}`
      ? (First extends keyof T
        ? { [K in keyof T]: K extends First ? DeepOptional<T[K], Rest> : T[K] }
        : T
      )
      : T
    )
  );



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


export type IsOptional<T> = T extends {} ? (keyof T extends never ? true : false) : true;


// Utility type that checks if two types X and Y are identical.
export type IsEquals<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? true : false;

// Determines if all properties of type T are optional. It iterates over each property key K of T,
// and uses the IfEquals utility to check if making the property K optional in a new type would
// result in the same type as T. If all properties are optional, it results in true, otherwise false.
export type AllPropertiesOptional<T> = {
  [K in keyof T]-?: IsEquals<{ [Q in K]: T[K] }, { [Q in K]?: T[K] }> extends true ? never : K
}[keyof T] extends never ? true : false;


export type IsEmpty<T> = [T] extends [undefined] | [null] | [never] ? true : false


// Type that checks if a type T is either undefined, null, never, or an object with all optional properties.
// This is useful for determining if a parameter type effectively doesn't require a value to be provided,
// because it's either a type that represents "no value" or an object where all properties are optional.
export type IsEmptyOrAllOptional<T> =
  // First, checks if T is one of the "empty" types: undefined, null, or never.
  IsEmpty<T> extends true
  ? true
  : (
    // Then, checks if T is an object type with all properties being optional.
    T extends object
    ? (AllPropertiesOptional<T> extends true ? true : false)
    :
    // For all other types, returns false, indicating that they are not considered "empty" or fully optional.
    false
  )



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

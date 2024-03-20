// Enums for front and back validation error codes
export enum ValidationErrorCodeEnum {
  REQUIRED = "REQUIRED",
  MAX_LENGTH = "MAX_LENGTH",
  MIN_LENGTH = "MIN_LENGTH",
  FORMAT_LETTERS = "FORMAT_LETTERS",
  FORMAT_NUMBERS = "FORMAT_NUMBERS",
  FORMAT_ALPHANUMERICS = "FORMAT_ALPHANUMERICS",
  MIN_NUMBER = "MIN_NUMBER",
  MAX_NUMBER = "MAX_NUMBER",
  EQ_NUMBER = "EQ_NUMBER",
  EQ_LENGTH = "EQ_LENGTH",

  // @TODO
  // FORMAT_CODE = "FORMAT_CODE",
}

// @TODO
// Enums for back-only validation error codes
export enum BackValidationErrorCodeEnum {
  TYPE_STRING = "TYPE_STRING",
  // TYPE_NUMBER = "TYPE_NUMBER",
  // DATE_ISO_8601 = "DATE_ISO_8601",
  // DATE_YYYY_MM_DD = "DATE_YYYY_MM_DD",
  // UNIQUE = "UNIQUE",
  // FORMAT_PHONE = "FORMAT_PHONE",
  // INVALID_VERIFICATION_CODE = "INVALID_VERIFICATION_CODE",
  // ADDRESS_NOT_FOUND = "ADDRESS_NOT_FOUND",
  // DATE_OF_BIRTH_INVALID = "DATE_OF_BIRTH_INVALID",
  // RANGE_DOB = "RANGE_DOB",
  // IN = "IN",
}

// Enums for back-only error codes
export enum BackErrorCodeEnum {
  SERVER = "SERVER",
}




export const ErrorCodeEnum = { ...ValidationErrorCodeEnum, ...BackValidationErrorCodeEnum, ...BackErrorCodeEnum };
// Type alias for the keys of ErrorCodeEnum
export type ErrorCodeEnum = keyof typeof ErrorCodeEnum;

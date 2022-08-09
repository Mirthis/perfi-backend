"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregateSpendBy = exports.AuthErrorName = exports.PlaidErrorName = exports.ErrorType = exports.AuthTokenType = exports.ExcludedTransactionsFilter = void 0;
var ExcludedTransactionsFilter;
(function (ExcludedTransactionsFilter) {
    ExcludedTransactionsFilter[ExcludedTransactionsFilter["ONLY_EXCLUDED"] = 0] = "ONLY_EXCLUDED";
    ExcludedTransactionsFilter[ExcludedTransactionsFilter["ONLY_INCLUDED"] = 1] = "ONLY_INCLUDED";
    ExcludedTransactionsFilter[ExcludedTransactionsFilter["ALL"] = 2] = "ALL";
})(ExcludedTransactionsFilter = exports.ExcludedTransactionsFilter || (exports.ExcludedTransactionsFilter = {}));
var AuthTokenType;
(function (AuthTokenType) {
    AuthTokenType["VERIFY_EMAIL"] = "verify_email";
    AuthTokenType["RESET_PASSWORD"] = "reset_password";
})(AuthTokenType = exports.AuthTokenType || (exports.AuthTokenType = {}));
var ErrorType;
(function (ErrorType) {
    ErrorType["AUTH_ERROR"] = "AuthError";
    ErrorType["VALIDATION_ERROR"] = "ValidationError";
    ErrorType["PLAID_ERROR"] = "PlaidError";
    ErrorType["GENERIC_ERROR"] = "GenericError";
})(ErrorType = exports.ErrorType || (exports.ErrorType = {}));
var PlaidErrorName;
(function (PlaidErrorName) {
    PlaidErrorName["DUPLICATE_INSTITUTION"] = "DuplicateInstitution";
})(PlaidErrorName = exports.PlaidErrorName || (exports.PlaidErrorName = {}));
var AuthErrorName;
(function (AuthErrorName) {
    AuthErrorName["USER_ALREADY_VERIFIED"] = "UserAlreadyVerified";
    AuthErrorName["USER_INACTIVE"] = "UserInactive";
    AuthErrorName["USER_CREDENTIALS_NOT_FOUND"] = "UserCredentialsNotFound";
    AuthErrorName["USER_EMAIL_NOT_FOUND"] = "UserEmailNotFound";
    AuthErrorName["USER_NOT_VERIFIED"] = "UserNotVerified";
    AuthErrorName["USER_UNAUTHORIZED"] = "UserUnauthorized";
    AuthErrorName["VERIFY_EMAIL_TOKEN_NOT_FOUND"] = "VerifyEmailTokenNotFound";
    AuthErrorName["VERIFY_EMAIL_TOKEN_EXPIRED"] = "VerifyEmailTokenExpired";
    AuthErrorName["VERIFY_PASSWORD_TOKEN_NOT_FOUND"] = "VerifyPasswordTokenNotFound";
    AuthErrorName["VERIFY_PASSWORD_TOKEN_EXPIRED"] = "VerifyPasswordTokenExpired";
})(AuthErrorName = exports.AuthErrorName || (exports.AuthErrorName = {}));
var AggregateSpendBy;
(function (AggregateSpendBy) {
    AggregateSpendBy["DAY"] = "day";
    AggregateSpendBy["MONTH"] = "month";
    AggregateSpendBy["CATEGORY"] = "category";
})(AggregateSpendBy = exports.AggregateSpendBy || (exports.AggregateSpendBy = {}));
// enum ApiErrorType {
//   AUTH = 'auth',
//   VALIDATION = 'validation',
//   GENERIC = 'generic',
// }
// enum AuthErrorCodes {
//   USER_NOT_VERIFIED,
//   USER_NOT_ACTIVE,
//   USER_NOT_FOUND,
// }
// enum GenericErrorCodes {
//   USER_NOT_VERIFIED,
//   USER_NOT_ACTIVE,
//   USER_NOT_FOUND,
// }
// export interface ApiError {
//   type: ApiErrorType;
//   code: number;
//   message: string;
// }
// export interface AuthError extends ApiError {
//   type: ApiErrorType.AUTH;
//   code: AuthErrorCodes;
// }
// export interface GenericError extends ApiError {
//   type: ApiErrorType.GENERIC;
//   code: GenericErrorCodes;
// }

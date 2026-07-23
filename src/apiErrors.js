export const API_ERROR_KEYS = Object.freeze({
  invalid_credentials: "apiErrors.invalidCredentials",
  user_already_exists: "apiErrors.userAlreadyExists",
  authentication_required: "apiErrors.authenticationRequired",
  admin_required: "apiErrors.adminRequired",
  unsupported_file_type: "apiErrors.unsupportedFileType",
  file_too_large: "apiErrors.fileTooLarge",
  invalid_image: "apiErrors.invalidImage",
  image_processing_failed: "apiErrors.imageProcessingFailed",
  empty_file: "apiErrors.emptyFile",
  missing_file: "apiErrors.missingFile",
  labels_required: "apiErrors.labelsRequired",
  image_classification_failed: "apiErrors.imageClassificationFailed",
  password_required: "apiErrors.passwordRequired",
  hibp_unavailable: "apiErrors.hibpUnavailable",
  email_service_unavailable: "apiErrors.emailServiceUnavailable",
  rate_limit_exceeded: "apiErrors.rateLimitExceeded",
  validation_error: "apiErrors.validationError",
  bad_request: "apiErrors.badRequest",
  forbidden: "apiErrors.forbidden",
  not_found: "apiErrors.notFound",
  method_not_allowed: "apiErrors.methodNotAllowed",
  http_error: "apiErrors.httpError",
  internal_error: "apiErrors.internalError",
});

export function resolveApiErrorKey(errorCode, fallbackKey) {
  if (typeof errorCode !== "string") return fallbackKey;
  return API_ERROR_KEYS[errorCode] || fallbackKey;
}

export function getApiErrorMessage(payload, t, fallbackKey) {
  return t(resolveApiErrorKey(payload?.error_code, fallbackKey));
}

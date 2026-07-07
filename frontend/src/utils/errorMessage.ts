type ApiErrorDetails = {
  message?: string;
};

type ApiErrorResponse = {
  data?: {
    message?: string;
    details?: ApiErrorDetails[];
  };
};

type ApiErrorLike = {
  response?: ApiErrorResponse;
};

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return fallback;
  }

  const apiError = error as ApiErrorLike;
  const details = apiError.response?.data?.details;

  if (details?.length) {
    const messages = details
      .map((detail) => detail.message)
      .filter((message): message is string => Boolean(message));

    if (messages.length) {
      return messages.join(", ");
    }
  }

  return apiError.response?.data?.message || fallback;
}

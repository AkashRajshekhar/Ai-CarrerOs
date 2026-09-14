export const getApiErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again.",
) => {
  if (!error) return fallback;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.code === "ECONNABORTED" || error.code === "ERR_NETWORK")
    return "The server is unavailable. Please check that the backend is running.";
  return fallback;
};

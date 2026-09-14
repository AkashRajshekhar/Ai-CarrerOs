export const notFound = (request, _response, next) => {
  const error = new Error(
    `Route not found: ${request.method} ${request.originalUrl}`,
  );
  error.statusCode = 404;
  next(error);
};

const getErrorDetails = (error) => {
  if (error.name === "ValidationError") {
    return {
      statusCode: 400,
      message: Object.values(error.errors)
        .map((item) => item.message)
        .join(" "),
    };
  }
  if (error.name === "CastError")
    return { statusCode: 400, message: "Invalid request value." };
  if (error.code === 11000)
    return {
      statusCode: 409,
      message: "A record with these details already exists.",
    };
  if (error.type === "entity.parse.failed")
    return {
      statusCode: 400,
      message: "Request body must contain valid JSON.",
    };
  if (error.name === "MulterError") {
    return {
      statusCode: 400,
      message:
        error.code === "LIMIT_FILE_SIZE"
          ? "Uploaded file is too large."
          : "Invalid file upload.",
    };
  }
  if (error.message === "Origin is not allowed by CORS")
    return { statusCode: 403, message: "This client origin is not allowed." };
  return {
    statusCode: error.statusCode || 500,
    message: error.statusCode
      ? error.message
      : "Something went wrong on the server.",
  };
};

export const errorHandler = (error, _request, response, _next) => {
  const { statusCode, message } = getErrorDetails(error);
  if (statusCode >= 500) console.error(error);
  return response.status(statusCode).json({ success: false, message });
};

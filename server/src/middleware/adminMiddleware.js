export const requireAdmin = (request, response, next) => {
  if (request.user?.role !== "admin") {
    return response.status(403).json({
      success: false,
      message: "Admin access is required.",
    });
  }

  return next();
};

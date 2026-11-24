export const requireRole = (...roles) => (request, response, next) => {
  if (!roles.includes(request.user?.role)) {
    return response.status(403).json({
      success: false,
      message: "You do not have permission to access this resource.",
    });
  }

  return next();
};
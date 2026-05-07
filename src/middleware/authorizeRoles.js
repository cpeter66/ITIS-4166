export function authorizeRoles(...allowedRoles) {
  return function (req, res, next) {
    if (!req.user) {
      const error = new Error('Not authenticated');
      error.status = 401;
      return next(error);
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      const error = new Error('Forbidden: insufficient permission');
      error.status = 403;
      return next(error);
    }
    
    return next();
  };
}
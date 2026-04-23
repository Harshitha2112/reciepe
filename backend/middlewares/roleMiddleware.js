/**
 * Middleware: authorizeRoles
 * Restricts route access based on user role.
 * Usage: authorizeRoles("ADMIN", "SUBADMIN")
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        `Access denied. Role '${req.user?.role}' is not permitted.`
      );
    }
    next();
  };
};

module.exports = { authorizeRoles };

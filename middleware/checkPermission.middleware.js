const ApiError = require("../utils/ApiError");

function hasPermission(permission) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) throw new ApiError(401, "Unauthorized");
    const userPermissions = user.roles.flatMap((role) => role.permissions);
    if (userPermissions.includes(permission)) {
      next();
    } else {
      throw new ApiError(403, "Forbidden - Insufficient permissions");
    }
  };
}

module.exports = hasPermission;

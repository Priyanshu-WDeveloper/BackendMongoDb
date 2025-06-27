const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const verifyRoles = (...allowedRoles) => {
  return asyncHandler((req, res, next) => {
    // console.log("ROLES Bosy", req.body);
    // console.log("ROLES Role", req.role);
    // console.log("ROLES Roles", req.roles);
    // console.log(req);

    const userRoles = req.roles || (req.user && req.user.role); //comes from verifyJWT ot token ??
    if (!userRoles)
      throw new ApiError(401, "Authentication required: no  Roles Provided");
    // const rolesArray = [...allowedRoles];
    // console.log(rolesArray);
    // console.log(req.roles);
    const hasRole = userRoles.some((role) =>
      allowedRoles.includes(role.name || role)
    );
    console.log("hasRole", hasRole);

    // const match = req.roles
    //   .map((role) => rolesArray.includes(role))
    //   .find((val) => val === true);
    if (!hasRole)
      throw new ApiError(403, "Forbidden - Insufficient permissions");
    next();
  });
  // return (req, res, next) => {
  //   if (!req?.roles) return res.sendStatus(401);
  //   const rolesArray = [...allowedRoles];
  //   console.log(rolesArray);
  //   console.log(req.roles);
  //   const match = req.roles
  //     .map((role) => rolesArray.includes(role))
  //     .find((val) => val === true);
  //   if (!match) return res.sendStatus(401);
  //   next();
  // };
};
module.exports = verifyRoles;

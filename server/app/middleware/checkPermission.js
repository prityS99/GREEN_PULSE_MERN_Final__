const roles = require("../config/roles.json");

const checkPermission = (...requiredPermissions) => {
  return (req, res, next) => {
    try {

      const userRole = req.user.role;

      // User role check
      if (!userRole) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized access",
        });
      }

      // Get role permissions
      const rolePermissions =
        roles.roles[userRole]?.permissions || [];

      // Check permissions
      const hasPermission =
        requiredPermissions.every((permission) =>
          rolePermissions.includes(permission)
        );

      // Permission denied
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: "Permission denied",
        });
      }

      next();

    } catch (error) {

      return res.status(500).json({
        success: false,
        message: error.message,
      });

    }
  };
};

module.exports = checkPermission;



// const roles = require("../config/roles.json");

// const checkPermission = (...requiredPermissions) => {
//   return (req, res, next) => {
//     try {
//       const userRole = req.user.role;

//       if (!userRole) {
//         return res.status(401).json({
//           success: false,
//           message: "Unauthorized access",
//         });
//       }

//       const rolePermissions =
//         roles.roles[userRole]?.permissions || [];

//       const hasPermission = requiredPermissions.every((permission) =>
//         rolePermissions.includes(permission)
//       );

//       if (!hasPermission) {
//         return res.status(403).json({
//           success: false,
//           message: "Permission denied",
//         });
//       }

//       next();
//     } catch (error) {
//       return res.status(500).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   };
// };

// module.exports = checkPermission;
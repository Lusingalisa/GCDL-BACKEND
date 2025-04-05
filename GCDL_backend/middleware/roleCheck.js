// const {PERMISSIONS} = require('../config/roles');


// const checkRole = (allowedRoles) => {
//   if (!Array.isArray(allowedRoles)) {
//     throw new Error('Allowed roles must be an array');
//   }
//   return (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({ error: 'Unauthorized' });
//     }
    
//     if (!allowedRoles.includes(req.user.role)) {
//       return res.status(403).json({ 
//         error: `Forbidden - Required roles: ${allowedRoles.join(', ')}`,
//         yourRole: req.user.role
//       });
//     }

//     next();
//   };
// };
// // Create permission checker
// const hasPermission = (permissionKey) => {
//     const allowedRoles = PERMISSIONS[permissionKey];
//     if (!allowedRoles) {
//       throw new Error(`Invalid permission key: ${permissionKey}`);
//     }
//     return checkRole(allowedRoles);
//   };

// // Add permission check utility directly to middleware

    
    

// module.exports = {checkRole,hasPermission};

// middleware/roleCheck.js
const { PERMISSIONS } = require('../config/roles');

const checkRole = (allowedRoles) => {
  if (!Array.isArray(allowedRoles)) {
    throw new Error('Allowed roles must be an array');
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - No user found' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Forbidden - Required roles: ${allowedRoles.join(', ')}`,
        yourRole: req.user.role
      });
    }
    next();
  };
};

const hasPermission = (permissionKey) => {
  const allowedRoles = PERMISSIONS[permissionKey];
  if (!allowedRoles) {
    throw new Error(`Invalid permission key: ${permissionKey}`);
  }
  return checkRole(allowedRoles);
};

module.exports = { checkRole, hasPermission };

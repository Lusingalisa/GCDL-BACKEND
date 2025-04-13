
// const { PERMISSIONS } = require('../config/roles');

// const checkRole = (allowedRoles) => {
//   if (!Array.isArray(allowedRoles)) {
//     throw new Error('Allowed roles must be an array');
//   }

//   return (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({ error: 'Unauthorized - No user found' });
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

// const hasPermission = (permissionKey) => {
//   const allowedRoles = PERMISSIONS[permissionKey];
//   if (!allowedRoles) {
//     throw new Error(`Invalid permission key: ${permissionKey}`);
//   }
//   return checkRole(allowedRoles);
// };

// module.exports = { checkRole, hasPermission };

const { ROLES, PERMISSIONS, ROLE_HIERARCHY } = require('../config/roles');

// Enhanced role checking with hierarchy support
const checkRole = (allowedRoles) => {
  if (!Array.isArray(allowedRoles)) {
    throw new Error('Allowed roles must be an array');
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - No user found' });
    }

    // Check direct role match
    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    // Check role hierarchy if exists
    if (ROLE_HIERARCHY && ROLE_HIERARCHY[req.user.role]) {
      const hasPermission = ROLE_HIERARCHY[req.user.role].some(role => 
        allowedRoles.includes(role)
      );
      
      if (hasPermission) {
        return next();
      }
    }

    return res.status(403).json({ 
      error: `Forbidden - Required roles: ${allowedRoles.join(', ')}`,
      yourRole: req.user.role,
      message: 'Insufficient privileges'
    });
  };
};

// Enhanced permission checker with hierarchy support
const hasPermission = (permissionKey) => {
  const allowedRoles = PERMISSIONS[permissionKey];
  if (!allowedRoles) {
    throw new Error(`Invalid permission key: ${permissionKey}`);
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - No user found' });
    }

    // Check direct permission
    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    // Check hierarchical permissions if exists
    if (ROLE_HIERARCHY && ROLE_HIERARCHY[req.user.role]) {
      const hasPermission = ROLE_HIERARCHY[req.user.role].some(role => 
        allowedRoles.includes(role)
      );
      
      if (hasPermission) {
        return next();
      }
    }

    return res.status(403).json({ 
      error: `Forbidden - Required permission: ${permissionKey}`,
      yourRole: req.user.role,
      requiredRoles: allowedRoles,
      message: 'Insufficient privileges'
    });
  };
};

// Specific role checkers for common user management actions
const canManageUsers = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // CEO can do all user management
  if (req.user.role === ROLES.CEO) {
    return next();
  }

  // Managers can view users but not modify roles
  if (req.user.role === ROLES.MANAGER && req.method === 'GET') {
    return next();
  }

  return res.status(403).json({ 
    error: 'Forbidden - User management restricted to CEO',
    yourRole: req.user.role
  });
};

module.exports = {
  checkRole,
  hasPermission,
  canManageUsers
};
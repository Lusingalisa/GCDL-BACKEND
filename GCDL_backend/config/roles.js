

// module.exports = {
//     // Main role constants
//     ROLES: {
//       CEO: 'ceo',
//       MANAGER: 'manager', 
//       SALES_AGENT: 'sales_agent'
//     },
  
//     // Role hierarchy for inheritance
//     ROLE_HIERARCHY: {
//       ceo: ['ceo', 'manager', 'sales_agent'],
//       manager: ['manager', 'sales_agent'],
//       sales_agent: ['sales_agent']
//     },
  
//     // Permission mapping
//     PERMISSIONS: {
//       // Sales permissions
//       CREATE_SALE: ['sales_agent', 'manager'],
//       VIEW_ALL_SALES: ['manager', 'ceo'],
//       VIEW_OWN_SALES: ['sales_agent'],
//       UPDATE_SALE: ['manager'],
//       DELETE_SALE: ['ceo'],
      
//       // User management
//       CREATE_USER: ['ceo'],
//       VIEW_USERS: ['manager', 'ceo'],
      
//       // Stock management
//       UPDATE_STOCK: ['manager', 'ceo'],
      
//       // Procurement
//       CREATE_PROCUREMENT: ['manager'],
//       VIEW_PROCUREMENT: ['manager', 'ceo']
//     },
  
//     // Enhanced permission checker
//     hasPermission: function(userRole, permissionKey) {
//       const allowedRoles = this.PERMISSIONS[permissionKey] || [];
//       return allowedRoles.includes(userRole) || 
//              (this.ROLE_HIERARCHY[userRole] && 
//               this.ROLE_HIERARCHY[userRole].some(role => allowedRoles.includes(role)));
//     }
//   };

// config/roles.js
module.exports = {
    ROLES: {
      CEO: 'ceo',
      MANAGER: 'manager', 
      SALES_AGENT: 'sales_agent'
    },
    PERMISSIONS: {
      CREATE_SALE: ['sales_agent', 'manager'],
      VIEW_ALL_SALES: ['manager', 'ceo'],
      VIEW_OWN_SALES: ['sales_agent'],
      UPDATE_SALE: ['manager'],
      DELETE_SALE: ['ceo'],
      CREATE_USER: ['ceo'],
      VIEW_USERS: ['manager', 'ceo'],
      VIEW_STOCK: ['sales_agent', 'manager', 'ceo'],
      DELETE_STOCK:['admin'],
      UPDATE_STOCK: ['manager', 'ceo'],
      CREATE_PROCUREMENT: ['manager'],
      VIEW_PROCUREMENT: ['manager', 'ceo']
    }
  };
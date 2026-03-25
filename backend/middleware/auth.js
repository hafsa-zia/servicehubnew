const jwt = require('jsonwebtoken');

// Role-based authentication middleware
const auth = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      console.log('Auth middleware accessed');
      
      // Get token from header
      const authHeader = req.header('Authorization');
      const token = authHeader ? authHeader.replace('Bearer ', '') : null;
      
      console.log('Token received:', token ? 'Yes' : 'No');
      
      if (!token) {
        console.log('No token provided');
        return res.status(401).json({ message: 'No token, authorization denied' });
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      console.log('Token decoded, user role:', decoded.role);
      
      // Check if user has required role
      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        console.log('User role not allowed:', decoded.role, 'Required roles:', allowedRoles);
        return res.status(403).json({ message: 'Access denied, insufficient permissions' });
      }
      
      // Add user data to request
      req.user = decoded;
      console.log('User authenticated successfully');
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401).json({ message: 'Token is not valid', error: error.message });
    }
  };
};

module.exports = auth;

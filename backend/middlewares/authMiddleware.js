const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    console.log('[Middleware] Checking authentication...');
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[Middleware] No Bearer token found');
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('[Middleware] Token:', token.substring(0, 20) + '...');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[Middleware] Decoded:', {
      userId: decoded.userId,
      iat: decoded.iat,
      exp: decoded.exp
    });

    console.log('[Middleware] Full decoded object:', decoded);
    
    const userId = decoded.userId || decoded.id || decoded._id;
    
    if (!userId) {
      console.log('[Middleware] No user ID found in token');
      return res.status(401).json({
        success: false,
        message: 'Invalid token structure'
      });
    }
    
    console.log('[Middleware] Extracted userId:', userId);

    const user = await User.findById(userId);
    
    if (!user) {
      console.log('[Middleware] User not found for ID:', userId);
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('[Middleware] Found user:', user.email);

    req.user = user;
    req.userId = userId;
    
    console.log('[Middleware] Attached to req:', {
      hasUser: !!req.user,
      hasUserId: !!req.userId,
      userId: req.userId,
      userEmail: req.user.email
    });
    
    next();

  } catch (error) {
    console.error('[Middleware] Error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

module.exports = authMiddleware;
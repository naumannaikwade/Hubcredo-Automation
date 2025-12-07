const User = require('../models/User');
const jwt = require('jsonwebtoken');
const webhookService = require('../services/webhookService');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

const authController = {
  register: async (req, res) => {
    try {
      console.log('[Auth] ===== FAST REGISTRATION START =====');
      console.log('[Auth] Request:', { 
        name: req.body.name?.substring(0, 20), 
        email: req.body.email,
        passwordLength: req.body.password?.length 
      });
      
      // Fast validation
      const { name, email, password } = req.body;
      
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }
      
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters'
        });
      }
      
      // Check existing user
      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
      
      // Create user with manual password hashing (fast)
      const salt = require('bcryptjs').genSaltSync(10);
      const hashedPassword = require('bcryptjs').hashSync(password, salt);
      
      const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        automationCount: 3, // Set immediately to 3 (will be processed)
        lastAutomation: new Date(),
        status: 'active'
      });
      
      console.log('[Auth] User created:', user.email);
      
      // Generate token
      const token = generateToken(user._id);
      
      // Prepare response
      const userResponse = user.toObject();
      delete userResponse.password;
      
      // Send SINGLE optimized webhook in background (fire-and-forget)
      setImmediate(async () => {
        try {
          console.log('[Auth Background] Starting optimized automation...');
          
          // Use the optimized single webhook
          const result = await webhookService.sendRegistrationPackage(user);
          
          if (result.success) {
            console.log('[Auth Background] Automation package delivered successfully');
          } else {
            console.log('[Auth Background] Automation delivery note:', result.note || result.error);
          }
          
        } catch (bgError) {
          console.log('[Auth Background] Non-critical error:', bgError.message);
        }
      });
      
      // Send IMMEDIATE response (within 1-2 seconds)
      const response = {
        success: true,
        message: '🎉 Registration successful! Welcome to Hubcredo!',
        token,
        user: userResponse,
        automation: {
          status: 'initiated',
          cycles: 3,
          delivery: 'background_processing',
          note: 'Welcome emails will arrive shortly. Check your inbox!'
        },
        performance: {
          response_time_ms: Date.now() - req.startTime,
          mode: 'optimized_fast'
        }
      };
      
      console.log('[Auth] ===== FAST REGISTRATION COMPLETE =====');
      console.log('[Auth] Response time:', response.performance.response_time_ms, 'ms');
      
      return res.status(201).json(response);
      
    } catch (error) {
      console.error('[Auth] Registration error:', error.message);
      
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
      
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: messages.join(', ')
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Registration failed. Please try again.'
      });
    }
  },

  login: async (req, res) => {
    try {
      console.log('[Auth] Login attempt:', req.body.email);
      
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide email and password'
        });
      }

      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const isPasswordCorrect = await user.comparePassword(password);
      
      if (!isPasswordCorrect) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const token = generateToken(user._id);
      
      const userResponse = user.toObject();
      delete userResponse.password;

      res.json({
        success: true,
        message: 'Login successful!',
        token,
        user: userResponse,
        stats: {
          automationCount: user.automationCount || 0,
          lastAutomation: user.lastAutomation,
          accountAge: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) + ' days'
        }
      });

    } catch (error) {
      console.error('[Auth] Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed. Please try again.'
      });
    }
  },

  getProfile: async (req, res) => {
    try {
      console.log('[Auth] Profile request for:', req.userId);
      
      const user = await User.findById(req.userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const userResponse = user.toObject();
      
      res.json({
        success: true,
        user: userResponse,
        account: {
          created: user.createdAt,
          automations: user.automationCount || 0,
          lastActivity: user.lastAutomation || 'No activity yet'
        }
      });

    } catch (error) {
      console.error('[Auth] Profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch profile'
      });
    }
  },

  // Health check endpoint
  health: async (req, res) => {
    try {
      const n8nHealth = await webhookService.checkHealth();
      
      res.json({
        success: true,
        service: 'Hubcredo Auth API',
        status: 'online',
        timestamp: new Date().toISOString(),
        n8n_integration: n8nHealth,
        performance: {
          mode: 'optimized',
          webhook_strategy: 'single_package_fire_and_forget'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = authController;
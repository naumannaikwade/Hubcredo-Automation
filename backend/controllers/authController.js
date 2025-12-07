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
      console.log('[Auth] Registration attempt:', req.body);
      
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        console.log('[Auth] Missing required fields');
        return res.status(400).json({
          success: false,
          message: 'Please provide name, email, and password'
        });
      }

      if (password.length < 6) {
        console.log('[Auth] Password too short');
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters'
        });
      }

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        console.log('[Auth] Email already exists:', email);
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }

      console.log('[Auth] Creating user...');
      const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        automationCount: 0,
        status: 'active'
      });

      console.log('[Auth] User created:', user.email);

      const token = generateToken(user._id);
      console.log('[Auth] Token generated');

      const userResponse = user.toJSON();
      
      console.log('[Auth] Sending registration webhook to n8n...');
      const webhookResult = await webhookService.sendUserRegistration(user);
      
      console.log(`[Auth] Webhook result: ${webhookResult.success ? 'Success' : 'Failed'}`);
      
      console.log('[Auth] Starting registration automation (3 cycles)...');
      
      const automationResults = [];
      let automationSuccessCount = 0;
      
      for (let i = 1; i <= 3; i++) {
        console.log(`[Auth] Registration automation cycle ${i}/3...`);
        
        try {
          const preWebhook = await webhookService.sendAutomationCycle(user, {
            cycleNumber: i,
            step: 'pre_email',
            action: 'registration_welcome',
            metadata: {
              registration: true,
              cycle: i,
              totalCycles: 3,
              userType: 'new'
            }
          });
          
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const postWebhook = await webhookService.sendAutomationCycle(user, {
            cycleNumber: i,
            step: 'post_email',
            action: 'welcome_email_sent',
            metadata: {
              emailType: 'welcome',
              cycle: i,
              timestamp: new Date().toISOString()
            }
          });
          
          automationSuccessCount++;
          automationResults.push({
            cycle: i,
            status: 'completed',
            preWebhook: preWebhook.success,
            postWebhook: postWebhook.success
          });
          
          console.log(`[Auth] Cycle ${i} completed`);
          
          if (i < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
        } catch (error) {
          console.error(`[Auth] Cycle ${i} failed:`, error.message);
          automationResults.push({
            cycle: i,
            status: 'failed',
            error: error.message
          });
        }
      }
      
      user.automationCount = 3;
      await user.save();
      
      const finalWebhook = await webhookService.sendAutomationComplete(user, {
        totalCycles: 3,
        completedCycles: automationSuccessCount,
        duration: 5000,
        successRate: (automationSuccessCount / 3) * 100,
        automationType: 'registration'
      });
      
      console.log('[Auth] Registration automation complete:', {
        successfulCycles: automationSuccessCount,
        totalCycles: 3,
        webhookSuccess: finalWebhook.success
      });
      
      const response = {
        success: true,
        message: 'Registration successful! Welcome to Hubcredo!',
        token,
        user: userResponse,
        automation: {
          success: true,
          automation_id: new Date().getTime(),
          cycles_requested: 3,
          cycles_completed: automationSuccessCount,
          cycles_failed: 3 - automationSuccessCount,
          details: '3-cycle welcome automation executed',
          webhook_integration: {
            registration: webhookResult.success,
            cycles: automationSuccessCount,
            final: finalWebhook.success
          }
        },
        next_steps: [
          'Account created successfully',
          'Welcome automation completed',
          'Dashboard access granted',
          'Check your email for welcome message'
        ]
      };
      
      console.log('[Auth] Registration completed successfully for:', user.email);
      
      res.status(201).json(response);

    } catch (error) {
      console.error('[Auth] Registration error:', error);
      
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered. Please try logging in.'
        });
      }
      
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: messages.join(', ')
        });
      }
      
      if (error.message.includes('webhook') || error.message.includes('n8n')) {
        console.log('[Auth] Webhook error, but registration successful');
        
        if (user && token) {
          return res.status(201).json({
            success: true,
            message: 'Registration successful! (Note: Some automation steps may have failed)',
            token,
            user: user.toJSON(),
            automation: {
              success: false,
              warning: 'Webhook integration failed, but account created successfully',
              error: error.message
            }
          });
        }
      }
      
      res.status(500).json({
        success: false,
        message: 'Registration failed. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  login: async (req, res) => {
    try {
      console.log('[Auth] Login attempt:', req.body.email);
      
      const { email, password } = req.body;

      if (!email || !password) {
        console.log('[Auth] Missing email or password');
        return res.status(400).json({
          success: false,
          message: 'Please provide email and password'
        });
      }

      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      
      console.log('[Auth] User found:', user ? 'Yes' : 'No');
      
      if (!user) {
        console.log('[Auth] User not found for email:', email);
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const isPasswordCorrect = await user.comparePassword(password);
      console.log('[Auth] Password correct:', isPasswordCorrect);
      
      if (!isPasswordCorrect) {
        console.log('[Auth] Invalid password for:', email);
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const token = generateToken(user._id);
      
      const userResponse = user.toJSON();
      
      try {
        await webhookService.sendToN8N({
          event: 'user_login',
          timestamp: new Date().toISOString(),
          source: 'hubcredo-backend',
          user: {
            id: user._id,
            email: user.email,
            lastLogin: new Date().toISOString()
          }
        });
        console.log('[Auth] Login webhook sent');
      } catch (webhookError) {
        console.log('[Auth] Login webhook failed:', webhookError.message);
      }

      console.log('[Auth] Login successful for:', user.email);

      res.json({
        success: true,
        message: 'Login successful! Welcome back!',
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
        message: 'Login failed. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  getProfile: async (req, res) => {
    try {
      console.log('[Auth] Profile request for user ID:', req.userId);
      
      const user = await User.findById(req.userId);
      
      if (!user) {
        console.log('[Auth] User not found for ID:', req.userId);
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const userResponse = user.toJSON();
      
      console.log('[Auth] Profile fetched for:', user.email);

      res.json({
        success: true,
        user: userResponse,
        account: {
          created: user.createdAt,
          status: user.status || 'active',
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

  updateProfile: async (req, res) => {
    try {
      const { name } = req.body;
      const user = await User.findById(req.userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (name) {
        user.name = name;
        await user.save();
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: user.toJSON()
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  },

  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.userId).select('+password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const isPasswordCorrect = await user.comparePassword(currentPassword);
      if (!isPasswordCorrect) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change password'
      });
    }
  },

  logout: async (req, res) => {
    try {
      console.log('[Auth] Logout requested for user ID:', req.userId);
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
  },

  verifyToken: async (req, res) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          valid: false,
          message: 'No token provided'
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          valid: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        valid: true,
        user: user.toJSON(),
        expires: new Date(decoded.exp * 1000)
      });

    } catch (error) {
      console.error('Token verification error:', error.message);
      res.status(401).json({
        success: false,
        valid: false,
        message: 'Invalid or expired token'
      });
    }
  }
};

module.exports = authController;
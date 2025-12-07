const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  automationCount: {
    type: Number,
    default: 0
  },
  lastAutomation: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true
});

// FIXED: Simplified pre-save middleware
userSchema.pre('save', async function() {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return;
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error;
  }
});

// ALTERNATIVE: Even simpler synchronous approach
// userSchema.pre('save', function() {
//   if (this.isModified('password')) {
//     this.password = bcrypt.hashSync(this.password, 10);
//   }
// });

userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Error comparing password:', error);
    throw error;
  }
};

userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.__v;
    delete ret._id;
    
    // Add id field
    ret.id = doc._id.toString();
    
    return ret;
  }
});

userSchema.set('toObject', {
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.__v;
    delete ret._id;
    
    ret.id = doc._id.toString();
    
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const farmerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  farmName: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  landAreaSize: {
    type: Number,
    required: [true, 'Land area size is required'],
    min: [0, 'Land area cannot be negative']
  },
  photo: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  zipcode: {
    type: String,
    trim: true,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    upiId: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
farmerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
farmerSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Remove password from JSON output
farmerSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const Farmer = mongoose.model('Farmer', farmerSchema);

module.exports = Farmer;

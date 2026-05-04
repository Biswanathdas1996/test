const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['client', 'freelancer', 'admin'],
      default: 'client',
    },
    customerDetails: {
      dateOfBirth: {
        type: Date,
      },
      fatherName: {
        type: String,
        trim: true,
      },
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
      },
      customerDetailsCompleted: {
        type: Boolean,
        default: false,
      },
    },
    incomeDetails: {
      employmentType: {
        type: String,
        enum: ['employed', 'self-employed', 'unemployed', 'retired'],
      },
      employer: {
        type: String,
        trim: true,
      },
      monthlyIncome: {
        type: Number,
        min: 0,
      },
      additionalIncome: {
        type: Number,
        min: 0,
        default: 0,
      },
      yearsEmployed: {
        type: Number,
        min: 0,
      },
      incomeDetailsCompleted: {
        type: Boolean,
        default: false,
      },
    },
    loanApplicationStatus: {
      type: String,
      enum: ['not_started', 'customer_details_submitted', 'income_details_submitted', 'under_review', 'approved', 'rejected'],
      default: 'not_started',
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

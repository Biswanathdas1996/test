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
      fullName: { type: String, trim: true },
      phoneNumber: { type: String, trim: true },
      address: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      dateOfBirth: { type: Date },
      ssn: { type: String, trim: true },
    },
    incomeDetails: {
      employmentType: {
        type: String,
        enum: ['employed', 'self-employed', 'unemployed', 'retired'],
      },
      employerName: { type: String, trim: true },
      jobTitle: { type: String, trim: true },
      annualIncome: { type: Number },
      monthlyIncome: { type: Number },
      additionalIncome: { type: Number, default: 0 },
      incomeSource: { type: String, trim: true },
    },
    formProgress: {
      customerDetailsCompleted: { type: Boolean, default: false },
      incomeDetailsCompleted: { type: Boolean, default: false },
      documentsUploaded: { type: Boolean, default: false },
    },
    loanApplicationStatus: {
      type: String,
      enum: ['not-started', 'in-progress', 'submitted', 'under-review', 'approved', 'rejected'],
      default: 'not-started',
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

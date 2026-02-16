// models/User.ts
import { Schema, model, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  userId?: string; // optional business short id
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  country?: string;
  referrer?: Types.ObjectId | null;
  position?: "left" | "right" | null;
  status?: "active" | "inactive" | "suspended" | "blocked" | "suspected";
  accountType?: "normal" | "powerleg" | "free"; // Account type for influencer management
  binaryTargetAmount?: number; // Target binary business amount to unlock withdrawals
  targetStatus?: "pending" | "completed"; // Status of binary target completion
  withdrawEnabled?: boolean; // Whether withdrawals are enabled (unlocked after target completion)
  walletAddress?: string; // crypto wallet address
  bankAccount?: {
    accountNumber?: string;
    bankName?: string;
    ifscCode?: string;
    accountHolderName?: string;
  };
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  temporaryPasswordHash?: string;
  temporaryPasswordExpiresAt?: Date;
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
  compareTemporaryPassword(candidate: string): Promise<boolean>;
  // add KYC refs, profile urls etc
}

const UserSchema = new Schema<IUser>({
  userId: { type: String, index: true, unique: true, sparse: true }, // optional short code
  name: { type: String },
  email: { type: String, index: true, sparse: true },
  phone: { type: String, index: true, sparse: true },
  password: { type: String },
  country: { type: String, index: true },
  referrer: { type: Schema.Types.ObjectId, ref: "User", index: true, default: null },
  position: { type: String, enum: ["left", "right"], default: null },
  status: { type: String, enum: ["active","inactive","suspended","blocked","suspected"], default: "active" },
  accountType: { type: String, enum: ["normal", "powerleg", "free"], default: "normal", index: true },
  binaryTargetAmount: { type: Number, default: 0 },
  targetStatus: { type: String, enum: ["pending", "completed"], default: "pending", index: true },
  withdrawEnabled: { type: Boolean, default: false, index: true },
  walletAddress: { type: String },
  bankAccount: {
    accountNumber: { type: String },
    bankName: { type: String },
    ifscCode: { type: String },
    accountHolderName: { type: String },
  },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  temporaryPasswordHash: { type: String },
  temporaryPasswordExpiresAt: { type: Date },
  createdAt: { type: Date, default: () => new Date() }
}, { timestamps: true });

// Password hashing
const SALT_ROUNDS = 12;

UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
    next();
  } catch (err) {
    next(err as any);
  }
});

// Instance method to compare password
UserSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.password);
};

// Instance method to compare temporary password (valid only until temporaryPasswordExpiresAt)
UserSchema.methods.compareTemporaryPassword = function (candidate: string): Promise<boolean> {
  if (!this.temporaryPasswordHash || !this.temporaryPasswordExpiresAt) return Promise.resolve(false);
  if (new Date() > this.temporaryPasswordExpiresAt) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.temporaryPasswordHash);
};

// Hide password and temporary password hash in JSON output
UserSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.temporaryPasswordHash;
    delete ret.__v;
    return ret;
  }
});

export const User = model<IUser>("User", UserSchema);

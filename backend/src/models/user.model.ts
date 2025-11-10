import bcrypt from 'bcryptjs';
import { Schema, model } from 'mongoose';
import type { Document, Model, CallbackWithoutResultAndOptionalError } from 'mongoose';

export type UserRole = 'admin' | 'member';
export type UserStatus = 'active' | 'disabled';

export interface User {
  email: string;
  passwordHash: string;
  fullName?: string;
  role: UserRole;
  status: UserStatus;
  tokenVersion: number;
  refreshTokenHash?: string | null;
}

export interface UserDocument extends User, Document {
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword(password: string): Promise<boolean>;
  setPassword(password: string): Promise<void>;
  setRefreshToken(refreshToken: string): Promise<void>;
  clearRefreshToken(): Promise<void>;
  isRefreshTokenValid(refreshToken: string): Promise<boolean>;
  incrementTokenVersion(): void;
  isModified(path: keyof User | string): boolean;
}

export interface UserModel extends Model<UserDocument> {
  createAdminSeed(): Promise<void>;
}

const userSchema = new Schema<UserDocument, UserModel>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    status: { type: String, enum: ['active', 'disabled'], default: 'active' },
    tokenVersion: { type: Number, default: 0 },
    refreshTokenHash: { type: String, default: null }
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function comparePassword(password: string) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.setPassword = async function setPassword(password: string) {
  const hash = await bcrypt.hash(password, 12);
  this.passwordHash = hash;
};

userSchema.methods.setRefreshToken = async function setRefreshToken(refreshToken: string) {
  const hash = await bcrypt.hash(refreshToken, 12);
  this.refreshTokenHash = hash;
};

userSchema.methods.clearRefreshToken = async function clearRefreshToken() {
  this.refreshTokenHash = null;
};

userSchema.methods.isRefreshTokenValid = async function isRefreshTokenValid(refreshToken: string) {
  if (!this.refreshTokenHash) {
    return false;
  }

  return bcrypt.compare(refreshToken, this.refreshTokenHash);
};

userSchema.methods.incrementTokenVersion = function incrementTokenVersion() {
  this.tokenVersion += 1;
};

const BCRYPT_REGEX = /^\$2[aby]?\$/i;

userSchema.pre<UserDocument>('save', async function hashPassword(
  this: UserDocument,
  next: CallbackWithoutResultAndOptionalError
) {
  if (!this.isModified('passwordHash')) {
    return next();
  }

  if (BCRYPT_REGEX.test(this.passwordHash)) {
    return next();
  }

  const hash = await bcrypt.hash(this.passwordHash, 12);
  this.passwordHash = hash;
  next();
});

userSchema.statics.createAdminSeed = async function createAdminSeed() {
  const adminExists = await this.exists({ role: 'admin' });
  if (adminExists) {
    return;
  }

  const admin = new this({
    email: 'admin@aplicatto.dev',
    passwordHash: await bcrypt.hash('Admin#1234', 12),
    role: 'admin'
  });

  await admin.save();
};

export const UserModel = model<UserDocument, UserModel>('User', userSchema);

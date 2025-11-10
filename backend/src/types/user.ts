import type { UserDocument, UserRole, UserStatus } from '../models/user.model';

export interface SafeUser {
  id: string;
  email: string;
  fullName?: string;
  role: UserRole;
  status: UserStatus;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

export function toSafeUser(user: UserDocument): SafeUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    status: user.status,
    tokenVersion: user.tokenVersion,
    createdAt: user.createdAt ?? new Date(),
    updatedAt: user.updatedAt ?? new Date()
  };
}

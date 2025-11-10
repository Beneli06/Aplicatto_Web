import createHttpError from 'http-errors';
import type { FilterQuery } from 'mongoose';

import { UserModel, type UserDocument, type UserRole, type UserStatus } from '../models/user.model';
import { toSafeUser, type SafeUser } from '../types/user';

export interface ListUsersOptions {
  page?: number;
  limit?: number;
  role?: UserRole;
  status?: UserStatus;
  search?: string;
}

export interface PaginatedUsers {
  data: SafeUser[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateUserInput {
  email: string;
  password: string;
  fullName?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface UpdateUserInput {
  fullName?: string | null;
  password?: string;
  role?: UserRole;
  status?: UserStatus;
}

export async function listUsers(options: ListUsersOptions = {}): Promise<PaginatedUsers> {
  const { page = 1, limit = 20, role, status, search } = options;

  const query: FilterQuery<UserDocument> = {};

  if (role) {
    query.role = role;
  }

  if (status) {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { email: { $regex: search, $options: 'i' } },
      { fullName: { $regex: search, $options: 'i' } }
    ];
  }

  const [data, total] = await Promise.all([
    UserModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    UserModel.countDocuments(query)
  ]);

  return {
    data: data.map(toSafeUser),
    total,
    page,
    limit
  };
}

export async function getUserById(userId: string): Promise<SafeUser> {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw createHttpError(404, 'Usuario no encontrado');
  }

  return toSafeUser(user);
}

export async function createUser(input: CreateUserInput): Promise<SafeUser> {
  const { email, password, fullName, role = 'member', status = 'active' } = input;

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw createHttpError(409, 'El correo electrónico ya está registrado');
  }

  const user = new UserModel({ email, fullName, role, status });
  await user.setPassword(password);
  await user.save();

  return toSafeUser(user);
}

export async function updateUser(userId: string, input: UpdateUserInput): Promise<SafeUser> {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw createHttpError(404, 'Usuario no encontrado');
  }

  if (typeof input.fullName !== 'undefined') {
    user.fullName = input.fullName ?? undefined;
  }

  if (input.role) {
    user.role = input.role;
  }

  if (input.status) {
    user.status = input.status;
  }

  if (input.password) {
    await user.setPassword(input.password);
  }

  await user.save();
  return toSafeUser(user);
}

export async function deleteUser(userId: string): Promise<void> {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw createHttpError(404, 'Usuario no encontrado');
  }

  await user.deleteOne();
}

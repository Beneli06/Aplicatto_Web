import createHttpError from 'http-errors';

import { UserModel, type UserDocument } from '../models/user.model';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { toSafeUser, type SafeUser } from '../types/user';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function registerUser(input: RegisterInput): Promise<{ user: SafeUser; tokens: AuthTokens }> {
  const { email, password, fullName } = input;

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw createHttpError(409, 'El correo electrónico ya está registrado');
  }

  const user = new UserModel({
    email,
    fullName,
    role: 'member',
    status: 'active'
  });

  await user.setPassword(password);
  await user.save();

  const tokens = await issueTokens(user);

  return { user: toSafeUser(user), tokens };
}

export async function loginUser(input: LoginInput): Promise<{ user: SafeUser; tokens: AuthTokens }> {
  const { email, password } = input;

  const user = await UserModel.findOne({ email });
  if (!user) {
    throw createHttpError(401, 'Credenciales inválidas');
  }

  if (user.status === 'disabled') {
    throw createHttpError(403, 'La cuenta se encuentra deshabilitada');
  }

  const passwordMatches = await user.comparePassword(password);
  if (!passwordMatches) {
    throw createHttpError(401, 'Credenciales inválidas');
  }

  const tokens = await issueTokens(user);
  return { user: toSafeUser(user), tokens };
}

export async function refreshTokens(refreshToken: string): Promise<{ user: SafeUser; tokens: AuthTokens }> {
  let payload: ReturnType<typeof verifyRefreshToken>;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw createHttpError(401, 'Token de actualización inválido');
  }

  const user = await UserModel.findById(payload.sub);
  if (!user) {
    throw createHttpError(401, 'Token de actualización inválido');
  }

  if (payload.tokenVersion !== user.tokenVersion) {
    throw createHttpError(401, 'Token expirado, inicia sesión nuevamente');
  }

  const refreshTokenIsValid = await user.isRefreshTokenValid(refreshToken);
  if (!refreshTokenIsValid) {
    throw createHttpError(401, 'Token de actualización no reconocido');
  }

  const tokens = await issueTokens(user);
  return { user: toSafeUser(user), tokens };
}

export async function logoutUser(userId: string): Promise<void> {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw createHttpError(404, 'Usuario no encontrado');
  }

  await user.clearRefreshToken();
  user.incrementTokenVersion();
  await user.save();
}

async function issueTokens(user: UserDocument): Promise<AuthTokens> {
  const accessToken = signAccessToken(user.id, user.role, user.tokenVersion);
  const refreshToken = signRefreshToken(user.id, user.role, user.tokenVersion);

  await user.setRefreshToken(refreshToken);
  await user.save();

  return { accessToken, refreshToken };
}

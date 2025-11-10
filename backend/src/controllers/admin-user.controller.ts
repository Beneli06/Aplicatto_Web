import type { Request, Response, NextFunction } from 'express';

import {
  createUser,
  deleteUser,
  getUserById,
  listUsers,
  updateUser
} from '../services/user.service';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = req.query.page ? Number.parseInt(req.query.page as string, 10) : undefined;
    const limit = req.query.limit ? Number.parseInt(req.query.limit as string, 10) : undefined;
    const role = req.query.role as 'admin' | 'member' | undefined;
    const status = req.query.status as 'active' | 'disabled' | undefined;
    const search = req.query.search as string | undefined;

    const result = await listUsers({ page, limit, role, status, search });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function findOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await getUserById(req.params.userId);
    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await updateUser(req.params.userId, req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await deleteUser(req.params.userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

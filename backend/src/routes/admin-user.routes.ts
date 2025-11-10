import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';

import { create, findOne, list, remove, update } from '../controllers/admin-user.controller';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/require-role';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get(
  '/',
  celebrate({
    [Segments.QUERY]: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
      role: Joi.string().valid('admin', 'member'),
      status: Joi.string().valid('active', 'disabled'),
      search: Joi.string().max(120)
    })
  }),
  list
);

router.get(
  '/:userId',
  celebrate({
    [Segments.PARAMS]: Joi.object({
      userId: Joi.string().hex().length(24).required()
    })
  }),
  findOne
);

router.post(
  '/',
  celebrate({
    [Segments.BODY]: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).max(128).required(),
      fullName: Joi.string().max(120).allow('', null),
      role: Joi.string().valid('admin', 'member').default('member'),
      status: Joi.string().valid('active', 'disabled').default('active')
    })
  }),
  create
);

router.patch(
  '/:userId',
  celebrate({
    [Segments.PARAMS]: Joi.object({
      userId: Joi.string().hex().length(24).required()
    }),
    [Segments.BODY]: Joi.object({
      fullName: Joi.string().max(120).allow('', null),
      password: Joi.string().min(8).max(128),
      role: Joi.string().valid('admin', 'member'),
      status: Joi.string().valid('active', 'disabled')
    })
      .min(1)
      .messages({ 'object.min': 'Se requiere al menos un campo para actualizar' })
  }),
  update
);

router.delete(
  '/:userId',
  celebrate({
    [Segments.PARAMS]: Joi.object({
      userId: Joi.string().hex().length(24).required()
    })
  }),
  remove
);

export { router as adminUserRouter };

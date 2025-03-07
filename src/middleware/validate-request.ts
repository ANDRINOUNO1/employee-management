import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export function validateRequest(req: Request, next: NextFunction, schema: Joi.Schema) {
    const { error, value } = schema.validate(req.body, { abortEarly: false, allowUnknown: true, stripUnknown: true });
    if (error) {
        next(`Validation error: ${error.details.map(x => x.message).join(', ')}`);
    } else {
        req.body = value;
        next();
    }
}
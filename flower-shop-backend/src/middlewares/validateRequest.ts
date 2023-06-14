import { Request, Response, NextFunction } from 'express';
import { AnySchema } from 'yup';

const validate = (schema: AnySchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate(req.body);
  
      next();
    } catch (error) {
      return res.status(400).send({ message: error.message });
    }
  };
};

export default validate;

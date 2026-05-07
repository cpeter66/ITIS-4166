import { validationResult } from 'express-validator';

export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const duplicateError = errors.array().find(err => 
      err.msg === 'Email already exists' || 
      err.msg === 'Category name already exists'
    );
    
    if (duplicateError) {
      return res.status(409).json({ 
        error: duplicateError.msg 
      });
    }
    
    return res.status(400).json({ 
      errors: errors.array().map((err) => err.msg) 
    });
  }
  
  next();
}
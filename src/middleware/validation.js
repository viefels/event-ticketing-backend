export const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          success: false,
          error: 'Validation failed', 
          details: result.error.errors 
        });
      }
      
      next();
    } catch (err) {
      return res.status(400).json({ 
        success: false, 
        error: err.message || 'Validation error' 
      });
    }
  };
};

export default { validateBody };

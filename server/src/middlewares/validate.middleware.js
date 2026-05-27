function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const fields = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return res.status(400).json({
        success: false,
        data: { fields },
        message: 'Datos de entrada inválidos',
      });
    }
    req.body = result.data;
    next();
  };
}

module.exports = validate;

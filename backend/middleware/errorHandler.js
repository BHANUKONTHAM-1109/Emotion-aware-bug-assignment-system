function notFoundHandler(req, res) {
  res.status(404).json({ message: "Route not found", path: req.originalUrl });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.statusCode || 500;
  const message = err.message || "Internal server error";
  res.status(status).json({
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
}

module.exports = { notFoundHandler, errorHandler };

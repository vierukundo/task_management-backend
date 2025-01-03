import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "An unexpected error occurred";
  // console.error(err.stack);

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
  });

  // console.error(err.stack);
};

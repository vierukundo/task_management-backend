import { Router } from "express";
import {
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTasksByUser,
} from "./controllers/tasks";

import {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "./controllers/UserController";
import {
  register,
  login,
  requestPasswordReset,
  resetPassword,
} from "./controllers/AuthController";
import {
  resetPasswordValidation,
  loginValidation,
  registerValidation,
  forgotPasswordValidation,
} from "./middleware/validation.middleware";

const router = Router();

// users routes
router.get("/users", getAllUsers);
router.get("/users/:id", getUser);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

router.get("/tasks", getAllTasks);
router.get("/tasks/users/:userId", getTasksByUser);
router.get("/tasks/:id", getTask);
router.post("/tasks", createTask);
router.put("/tasks/:id", updateTask);
router.delete("/tasks/:id", deleteTask);

// authentication
router.post("/auth/register", registerValidation, register);
router.post("/auth/login", loginValidation, login);
router.post(
  "/auth/forgot_password",
  forgotPasswordValidation,
  requestPasswordReset
);
router.post(
  "/auth/reset_password/:token",
  resetPasswordValidation,
  resetPassword
);

export default router;

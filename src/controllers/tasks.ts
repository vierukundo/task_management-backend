import { AppDataSource } from "../data-source";
import { Request, Response, NextFunction } from "express";
import { Task } from "../entity/Task";
import { User } from "../entity/User";
import { Status } from "../entity/Task";

// Get all tasks
export const getAllTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const taskRepository = AppDataSource.getRepository(Task);
    const tasks = await taskRepository.find({
      relations: ["created_by"], // Include data for user who created task
    });

    if (!tasks || tasks.length === 0) {
      res.status(404).json({ message: "No tasks found" });
      return;
    }

    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
};

// Get tasks created by a specific user
export const getTasksByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: userId },
      relations: ["tasks"],
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!user.tasks || user.tasks.length === 0) {
      res.status(404).json({ message: "No tasks found for this user" });
      return;
    }

    res.status(200).json(user.tasks);
  } catch (err) {
    next(err);
  }
};

// Get a single task by ID
export const getTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: "Task ID is required" });
      return;
    }

    const taskRepository = AppDataSource.getRepository(Task);
    const task = await taskRepository.findOne({
      where: { id },
      relations: ["created_by"],
    });

    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

// Create a new task
export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, description, status, createdBy } = req.body;

    if (!title || !createdBy) {
      res.status(400).json({ message: "Title and CreatedBy are required" });
      return;
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: createdBy } });

    if (!user) {
      res.status(404).json({ message: "Creator not found" });
      return;
    }

    const taskRepository = AppDataSource.getRepository(Task);
    const task = new Task();
    task.title = title;
    task.description = description || null;
    task.status = status || Status.IN_PROGRESS;
    task.created_by = user;

    await taskRepository.save(task);

    res.status(201).json({ message: "Task created successfully", task });
  } catch (err) {
    next(err);
  }
};

// Update a task
export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    if (!id) {
      res.status(400).json({ message: "Task ID is required" });
      return;
    }

    const taskRepository = AppDataSource.getRepository(Task);
    const task = await taskRepository.findOne({ where: { id } });

    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    if (title) task.title = title;
    if (description) task.description = description;
    if (status) task.status = status;

    await taskRepository.save(task);

    res.status(200).json({ message: "Task updated successfully", task });
  } catch (err) {
    next(err);
  }
};

// Delete a task
export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: "Task ID is required" });
      return;
    }

    const taskRepository = AppDataSource.getRepository(Task);
    const taskToRemove = await taskRepository.findOne({ where: { id } });

    if (!taskToRemove) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    await taskRepository.remove(taskToRemove);

    res.status(204).json({ message: "Task deleted successfully" });
  } catch (err) {
    next(err);
  }
};

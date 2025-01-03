import { AppDataSource } from "../data-source";
import { Request, Response, NextFunction } from "express";
import { User } from "../entity/User";

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find({
      relations: ["tasks"], // Include related tasks if needed
    });

    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: "User ID is required" });
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id },
      relations: ["tasks"],
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { first_name, last_name, role, status, password, email } = req.body;

    if (!first_name || !last_name || !email || !password || !role || !status) {
      res.status(400).json({ message: "Missing required parameters!" });
    }

    const userRepository = AppDataSource.getRepository(User);

    const user = new User();
    user.first_name = first_name;
    user.last_name = last_name;
    user.email = email;
    user.role = role;
    user.status = status;
    user.password = password; // Raw password is assigned and will be hashed automatically via the entity's `@BeforeInsert`

    await userRepository.save(user); // Automatically calls `hashPassword`

    res.status(201).json({ message: "User created successfully", user });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { first_name, last_name, role, status, password, email } = req.body;

    if (!id) {
      res.status(400).json({ message: "User ID is required!" });
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id } });

    if (!user) {
      res.status(404).json({ message: "User not found" });
    } else {
      // Update fields only if provided
      if (first_name) user.first_name = first_name;
      if (last_name) user.last_name = last_name;
      if (email) user.email = email;
      if (role) user.role = role;
      if (status) user.status = status;
      if (password) user.password = password;
      await userRepository.save(user);
    }

    res.status(200).json({ message: "User updated successfully", user });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: "User ID is required!" });
    }

    const userRepository = AppDataSource.getRepository(User);
    const userToRemove = await userRepository.findOne({ where: { id } });

    if (!userToRemove) {
      res.status(404).json({ message: "User not found" });
    } else {
      await userRepository.remove(userToRemove);
    }

    res.status(204).json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};

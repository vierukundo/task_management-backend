import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { User } from "../entity/User";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { AppDataSource } from "../data-source";
import { MoreThan } from "typeorm";
dotenv.config();

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ message: errors.array() });
    }
    const {
      first_name,
      last_name,
      email,
      password,
      confirm_password,
      role,
      status,
    } = req.body;

    if (password !== confirm_password) {
      res.status(400).json({ message: "Passwords do not match!" });
    }
    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOne({ where: { email } });

    if (existingUser) {
      res.status(400).json({ message: "Email already exists" });
    }

    const newUser = new User();
    newUser.first_name = first_name;
    newUser.last_name = last_name;
    newUser.password = password;
    newUser.role = role;
    newUser.email = email;
    if (status) newUser.status = status;

    await userRepository.save(newUser);

    const token = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      user: {
        id: newUser.id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { email },
      select: [
        "id",
        "email",
        "password",
        "first_name",
        "last_name",
        "role",
        "status",
      ],
    });

    if (!user || !(await user.comparePassword(password))) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });

    res.status(200).json({
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// reset password request
export const requestPasswordReset = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array() });
  }

  try {
    const { email } = req.body;

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }

    // Generate a token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour expiry

    // Save token and expiry to user record
    user.reset_password_token = resetToken;
    user.reset_password_expiry = resetTokenExpiry;
    await userRepository.save(user);

    // Send email with reset link (Example using nodemailer)
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER?.trim(),
        pass: process.env.EMAIL_PASS?.trim(),
      },
    });

    const resetUrl = `http://localhost:5173/resetPassword/${resetToken}`;

    const mailOptions = {
      to: email.trim(),
      from: process.env.EMAIL_USER?.trim(),
      subject: "Password Reset",
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        ${resetUrl}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (error) {
    next(error);
  }
};

// handles password reset
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array() });
  }

  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    const userRepository = AppDataSource.getRepository(User);

    if (password !== confirmPassword) {
      res.status(400).json({ message: "Passwords do not match" });
    }
    const user = await userRepository.findOne({
      where: {
        reset_password_token: token,
        reset_password_expiry: MoreThan(new Date()), // Check if token is not expired
      },
    });

    if (!user) {
      res.status(400).json({ message: "Invalid or expired token" });
      return;
    }
    // Update password

    user.password = password;
    user.reset_password_token = null;
    user.reset_password_expiry = null;
    await userRepository.save(user);

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
};

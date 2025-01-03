import { body, ValidationChain } from "express-validator";

// Reusable password validation function
const validatePassword = (field: string): ValidationChain =>
  body(field)
    .isLength({ min: 8 })
    .withMessage(`${field} must be at least 8 characters long.`)
    .matches(/\d/)
    .withMessage(`${field} must contain at least one number.`)
    .matches(/[A-Z]/)
    .withMessage(`${field} must contain at least one uppercase letter.`)
    .matches(/[a-z]/)
    .withMessage(`${field} must contain at least one lowercase letter.`)
    .matches(/[@$!%*?&#]/)
    .withMessage(`${field} must contain at least one special character.`);

// Define validation rules for registration
export const registerValidation: ValidationChain[] = [
  body("email").isEmail().withMessage("Please enter a valid email address."),
  validatePassword("password"),
];

// Define validation rules for login
export const loginValidation: ValidationChain[] = [
  body("email").isEmail().withMessage("Please enter a valid email address."),
  body("password").notEmpty().withMessage("Password is required."),
];

// Define validation rules for forgot password
export const forgotPasswordValidation: ValidationChain[] = [
  body("email").isEmail().withMessage("Please enter a valid email address."),
];

// Define validation rules for passwords
export const resetPasswordValidation: ValidationChain[] = [
  validatePassword("password"),
  validatePassword("confirmPassword"),
];
// Define validation rules for change password
export const changePasswordValidation: ValidationChain[] = [
  validatePassword("oldPassword"),
  validatePassword("newPassword"),
];

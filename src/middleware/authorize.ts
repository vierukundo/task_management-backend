import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import jwt from "jsonwebtoken";
import { User } from "../entity/User";
import { Role } from "../entity/Role";

interface Permission {
  [key: string]: string[]; // Each action maps to an array of feature names
}

interface RequestObj extends Request {
  user?: Partial<User>;
}

export const generateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, roleId } = req.body;

    const secretKey = process.env.JWT_SECRET || "your-secret-key";

    const payload = {
      userId,
      roleId,
    };

    const options = {
      expiresIn: "1h", // Token expires in 1 hour
    };

    const token = jwt.sign(payload, secretKey, options);
    res.status(200).json({ token: token });
  } catch (err) {
    next(err);
  }
};

export const authorize = (action: string, feature: string) => {
  return async (
    req: RequestObj,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      let role: Role | null;

      const roleRepository = AppDataSource.getRepository(Role);

      // Handle token-based role retrieval
      if (token) {
        const decoded: any = jwt.verify(
          token,
          process.env.JWT_SECRET || "secret"
        );
        // req.user = decoded;

        role = await roleRepository.findOne({ where: { id: decoded.roleId } });
        if (!role) {
          res
            .status(403)
            .json({ message: "Access denied: User role not found" });
          return;
        }
      } else if (!token && action === "read") {
        // Handle public 'Viewer' role for read-only actions
        role = await roleRepository.findOne({ where: { role_name: "Viewer" } });
        if (!role) {
          res
            .status(403)
            .json({ message: "Access denied: User role not found" });
          return;
        }
      } else {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      if (role.role_name === "Admin") {
        const forbiddenActions = ["create", "update", "delete"];
        if (feature === "users" && forbiddenActions.includes(action)) {
          const { role } = req.body;
          const { id } = req.params;
          const userRepository = AppDataSource.getRepository(User);
          const targetUser = await userRepository.findOne({ where: { id } });
          if (role === "Super Admin" || targetUser?.role === "Super Admin") {
            res.status(401).json({
              message: `You are not authorized to ${action} Super Admin`,
            });
          }
        }
      }

      // Check permissions
      console.log(role.role_name);
      console.log("Token: ", token);
      const permissions = role.permissions as Permission;
      const features = permissions?.[action];
      console.log(features);
      if (features.includes("all") || features.includes(feature)) {
        next();
      } else {
        res.status(403).json({ message: "Access denied!" });
      }
    } catch (err: any) {
      next(err);
    }
  };
};

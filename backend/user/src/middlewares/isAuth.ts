import type { Request, Response, NextFunction } from 'express';
import type { IUser } from '../models/user.js';
import jwt, { type JwtPayload } from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}

export const isAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                message: "Unauthorized",
            });
            return;
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            res.status(401).json({
                message: "Unauthorized: No token provided",
            });
            return;
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("JWT_SECRET is not defined in environment variables");
            res.status(500).json({
                message: "Internal server error",
            });
            return;
        }

        const decodedToken = jwt.verify(token, secret) as JwtPayload & { user: IUser };
        req.user = decodedToken.user;
        next();
    }
    catch (error) {
        console.error("Error in isAuth middleware", error);
        res.status(401).json({
            message: "Unauthorized: Invalid or expired token",
        });
    }
}
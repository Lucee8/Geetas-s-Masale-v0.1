/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'geetas-special-sunday-masala-secret-key';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: 'Super Admin' | 'Manager' | 'Staff';
    name: string;
  };
}

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Bearer <token>

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Forbidden. Invalid or expired token.' });
      }
      req.user = user as any;
      next();
    });
  } else {
    res.status(401).json({ error: 'Unauthorized. Authorization header is missing.' });
  }
}

export function authorizeRoles(roles: Array<'Super Admin' | 'Manager' | 'Staff'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden. You do not have permission for this resource.' });
    }

    next();
  };
}

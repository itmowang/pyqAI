import jwt from 'jsonwebtoken';

const { sign } = jwt;

export type UserRole = 'ADMIN' | 'VISITOR';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your-access-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  const options: jwt.SignOptions = {
    expiresIn: JWT_ACCESS_EXPIRES_IN,
  };
  return sign(payload, JWT_ACCESS_SECRET, options);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const options: jwt.SignOptions = {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  };
  return sign(payload, JWT_REFRESH_SECRET, options);
};

export const generateTokens = (payload: TokenPayload) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

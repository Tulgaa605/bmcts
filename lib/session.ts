import { SessionOptions } from 'iron-session';

export interface SessionUser {
  id: number;
  org_id: number;
  username: string;
  full_name: string;
  org_name: string;
  org_register: string;
}

export interface SessionData {
  user?: SessionUser;
  dbConnection?: string;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'nebo-2018-iron-session-secret-key-32chars!!',
  cookieName: 'nebo_session',
  cookieOptions: {
    // HTTP (LAN/PM2) дээр cookie хадгалагдахын тулд secure-ийг env-ээр удирдана
    secure: process.env.COOKIE_SECURE === 'true',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 8 * 60 * 60,
    path: '/',
  },
};

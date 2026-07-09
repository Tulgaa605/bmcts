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
  password: 'nebo-2018-iron-session-secret-key-32chars!!',
  cookieName: 'nebo_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 8 * 60 * 60,
  },
};

export interface User {
  id: string;
  email: string;
  name?: string;
  photoURL?: string;
  provider?: "google" | "email";
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: Date;
}

export interface OTPData {
  email: string;
  otp: string;
  expiresAt: Date;
  purpose: "signup" | "login";
}

export interface SignUpData {
  email: string;
  password: string;
  name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface OTPVerificationData {
  email: string;
  otp: string;
}

import { User } from "./auth";

export type { User };

export interface UserProfile extends User {
  phoneNumber?: string;
  dateOfBirth?: Date;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme?: "light" | "dark";
  notifications?: boolean;
}

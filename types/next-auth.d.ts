import { UserRole, UserStatus } from "@/types";
import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: UserRole;
    status: UserStatus;
    company?: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role: UserRole;
      status: UserStatus;
      company?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    status: UserStatus;
    company?: string;
  }
}

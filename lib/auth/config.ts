import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/db/connection";
import User from "@/lib/db/models/User.model";
import bcrypt from "bcryptjs";
import { UserRole, UserStatus } from "@/types";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await connectToDatabase();

        const creds = credentials as Record<string, unknown>;
        const query: Record<string, any> = {
          email: (creds.email as string).toLowerCase(),
        };
        if (creds.role) {
          query.role = creds.role;
        }

        const user = await User.findOne(query).select("+password");

        if (!user) {
          throw new Error("Invalid email or password");
        }

        if (!user.password) {
          throw new Error("Please use the correct sign-in method");
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        if (user.status === UserStatus.BANNED) {
          throw new Error("Your account has been banned. Contact support.");
        }

        if (user.status === UserStatus.SUSPENDED) {
          throw new Error("Your account is suspended. Contact support.");
        }

        // Update last login (non-blocking — don't await to keep login fast)
        User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() }).exec().catch(() => {});

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          image: user.avatar,
          company: user.company?.toString(),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: UserRole }).role;
        token.status = (user as { status: UserStatus }).status;
        token.company = (user as { company?: string }).company;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.status = token.status as UserStatus;
        session.user.company = token.company as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.AUTH_SECRET,
});

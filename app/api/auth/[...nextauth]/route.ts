import { getUsersCollection, loadDb } from "@/lib/server-utils";
import NextAuth, { AuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare, hash } from "bcrypt";
import { makeRequest } from "@/lib/make-request";
import { ObjectId } from "mongodb";

declare module "next-auth" {
  interface User {
    id: string;
    type: string;
  }
  interface Session {
    user: {
      id: string;
      type: string;
    };
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    type: string;
  }
}

const authOptions: AuthOptions = {
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.type = token.type;

      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.type = user.type;
      }
      return token;
    },
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
        type: { type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const db = await loadDb();
        const usersCollection = getUsersCollection(db);
        const existingUser = await usersCollection.findOne({
          email: credentials.email,
          type: credentials.type,
        });

        if (!existingUser) {
          const user = {
            _id: new ObjectId(),
            email: credentials.email,
            password: await hash(credentials.password, 10),
            type: credentials.type,
            customerId: undefined as string | undefined,
            walletId: undefined as string | undefined,
          };

          if (credentials.type === "customer") {
            const response = await makeRequest("POST", "/v1/customers", {
              email: credentials.email,
              name: credentials.email.split("@")[0],
            });

            user.customerId = response.data.id;
          } else if (credentials.type === "vendor") {
            const response = await makeRequest("POST", "/v1/user", {
              first_name: credentials.email.split("@")[0],
              contact: {
                contact_type: "personal",
                email: credentials.email,
              },
            });

            user.walletId = response.data.id;
          }

          const { insertedId } = await usersCollection.insertOne(user);

          return {
            id: `${insertedId}`,
            email: user.email,
            type: user.type,
            customerId: user.customerId,
          };
        }

        const isValid = await compare(
          credentials.password,
          existingUser.password
        );

        if (!isValid) {
          throw new Error("Wrong credentials. Try again.");
        }

        return {
          id: `${existingUser._id}`,
          email: existingUser.email,
          type: existingUser.type,
          customerId: existingUser.customerId,
          walletId: existingUser.walletId,
        };
      },
    }),
  ],
};
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions };

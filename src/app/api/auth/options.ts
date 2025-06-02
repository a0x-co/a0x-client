import "server-only";

// next
import { cookies } from "next/headers";

// next auth
import {
  NextAuthOptions,
  getServerSession as getServerSessionInternal,
} from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import CredentialsProvider from "next-auth/providers/credentials";

// farcaster auth
import { createAppClient, viemConnector } from "@farcaster/auth-client";

interface Profile {
  data: {
    username: string;
  };
}

const domain =
  process.env.NODE_ENV === "development"
    ? "localhost:3000"
    : "https://www.a0x.co";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
      authorization: {
        params: {
          scope: [
            "tweet.read",
            "tweet.write",
            "users.read",
            "offline.access",
          ].join(" "),
        },
      },
    }),
    CredentialsProvider({
      name: "Sign in with Farcaster",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
        name: {
          label: "Name",
          type: "text",
          placeholder: "0x0",
        },
        pfp: {
          label: "Pfp",
          type: "text",
          placeholder: "0x0",
        },
        nonce: {
          label: "Nonce",
          type: "text",
          placeholder: "0x0",
        },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const appClient = createAppClient({
          ethereum: viemConnector(),
        });
        try {
          const verifyResponse = await appClient.verifySignInMessage({
            message: credentials.message,
            signature: credentials.signature as `0x${string}`,
            domain: domain,
            nonce: credentials.nonce,
          });
          const { success, fid } = verifyResponse;
          if (!success) return null;

          return {
            id: fid.toString(),
            name: credentials.name,
            image: credentials.pfp,
          };
        } catch (error) {
          console.log("error", error);
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ account, user, profile }) {
      if (!account) return false;

      const cookieStore = cookies();
      const accountToSave = {
        accessToken: account.access_token,
        refreshToken: account.refresh_token,
        expiresIn: new Date(Date.now() + 3600 * 1000),
        username: (profile as Profile).data.username,
      };

      cookieStore.set("account", JSON.stringify(accountToSave));
      return true;
    },
    jwt({ token, account }) {
      if (account) {
        token.account = account;
      }
      return token;
    },
  },
};

export async function getServerSession() {
  const session = await getServerSessionInternal(authOptions);

  return session;
}

export async function getAccount() {
  const cookieStore = cookies();
  const account = cookieStore.get("account");
  return account ? JSON.parse(account.value) : null;
}

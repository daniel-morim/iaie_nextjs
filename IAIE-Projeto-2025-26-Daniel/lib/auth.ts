import { betterAuth } from "better-auth";
import { prismaAdapter }  from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { nextCookies } from "better-auth/next-js";
import { anonymous } from "better-auth/plugins/anonymous";
import { Role } from "@/generated/prisma";


export const auth = betterAuth({
  plugins: [
    nextCookies(),anonymous({onLinkAccount: async ({anonymousUser, newUser})=>{
      const employeeRes = await fetch ("http://localhost:3000/api/moloni/employees/countByEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newUser.user.email })
      })
      const employeeData = await employeeRes.json()

      const customerRes = await fetch ("http://localhost:3000/api/moloni/customers/countByEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newUser.user.email })
      })
      const customerData = await customerRes.json()
      let roleName = "user"
      if ( employeeData.count && employeeData.count > 0){
        roleName = "employee"
      }else if ( customerData.count && customerData.count > 0){
        roleName = "user"
      }else{
        roleName = "user"
        await fetch ("http://localhost:3000/api/moloni/customers/createAccount", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: newUser.user.email, name: newUser.user.name })
          })
          console.log(`🆕 Cliente Moloni criado para o utilizador ${newUser.user.email}`);
        }
        newUser.user.role = Role[roleName as keyof typeof Role]
        await prisma.users.update({
          where: { id: newUser.user.id },
          data: { role: Role[roleName as keyof typeof Role]}
        })
      }})
  ],

  // DESATIVADO: autenticação por email/senha
  emailAndPassword: {
    enabled: false
  },

  // DESATIVADO: envio de email de verificação
  emailVerification: undefined,

  baseURL: process.env.NODE_ENV === 'production'
    ? `https://rhythm-records-84mu.vercel.app`
    : "http://localhost:3000",

  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }
  },

  database: prismaAdapter(prisma, {
    provider: "postgresql",

  }),



  user: {
    modelName: "users",
    fields: {
      id: "id",
      email: "email",
      emailVerified: "emailverified",
      name: "name",
      image: "image",
      isAnonymous: "isanonymous",
    },
    additionalFields: {
      role: {
        type: "string",      // tipo do campo
        required: false,     // se é obrigatório
        defaultValue: "user",// valor padrão
        input: true,        // não expõe para o cliente criar/alterar
      },
    },
  },


  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
      secure: process.env.NODE_ENV === "production",
    },
    modelName: "sessions",
    fields: {
      id: "id",
      userId: "userid",
      token: "token",
      expiresAt: "expiresat",
      ipAddress: "ipaddress",
      userAgent: "useragent",
      createdAt: "createdat",
      updatedAt: "updatedat",
    }
  },

  verification: {
    modelName: "verifications",
    fields: {
      id: "id",
      identifier: "identifier",
      value: "value",
      expiresAt: "expiresat",
      createdAt: "createdat",
      updatedAt: "updatedat",
    },
  },

  account: {
    modelName: "accounts",
    fields: {
      id: "id",
      userId: "userid",
      providerIdColumn: "providerid",
      providerAccountIdColumn: "accountid",
      accessTokenColumn: "accesstoken",
      refreshTokenColumn: "refreshtoken",
      accessTokenExpiresColumn: "accesstokenexpiresat",
      refreshTokenExpiresColumn: "refreshtokenexpiresat",
      idTokenColumn: "idtoken",
      passwordColumn: "password",
    }
  },

  trustedOrigins: [
    "https://appleid.apple.com",
    ...(process.env.NODE_ENV === 'production'
      ? ["https://rhythm-records-84mu.vercel.app"]
      : ["http://localhost:3000"])
  ],

  secret: process.env.BETTER_AUTH_SECRET
});

export type Session = typeof auth.$Infer.Session.user;

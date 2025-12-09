import { createAuthClient } from "better-auth/client";
import { anonymousClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [anonymousClient()],
  user: {
    // Campos que queremos acessar no frontend
    fields: {
      id: "id",
      email: "email",
      emailVerified: "emailVerified",
      name: "name",
      image: "image",
      isAnonymous: "isAnonymous",
    },
    // Campos adicionais que queremos tipar no frontend
    additionalFields: {
      role: true, // apenas para tipagem, não cria/edita nada
    },
  },
});

export const signIn = async () => {
  await authClient.signIn.social({
    provider: "google",
  });
};

// Tipo da sessão disponível no frontend
export type Session = typeof authClient.$Infer.Session.user;
import prisma from "@/lib/prisma";
import { MoloniTokenResponse } from "@/models/types";

export async function getMoloniAuthData() {
  return await prisma.moloniAuth.findUnique({
    where: { id: 1 },
  });
}

export async function saveTokensToDb(tokens: MoloniTokenResponse) {

  const now = Date.now();

  // Access Token: expires_in → segundos → Date
  const accessExpiresAt =
    typeof tokens.expires_in === "number"
      ? new Date(now + tokens.expires_in * 1000)
      : tokens.expires_in;

  // Refresh Token: refresh_expires_in → timestamp → Date
  const refreshExpiresAt =
    typeof tokens.refresh_expires_in === "number"
      ? new Date(tokens.refresh_expires_in)
      : tokens.refresh_expires_in;

  await prisma.moloniAuth.upsert({
    where: { id: 1 },
    update: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      accessExpiresAt,
      refreshExpiresAt,
    },
    create: {
      id: 1,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      accessExpiresAt,
      refreshExpiresAt,
    },
  });

  console.log("💾 Novos tokens guardados no PostgreSQL.");
}

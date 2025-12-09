import { getMoloniAuthData } from "@/services/moloni";
import { MoloniTokenResponse } from "@/models/types";

const BUFFER_TIME_MS = 2 * 60 * 1000; 

export async function getValidMoloniToken(): Promise<string> {
  const authData = await getMoloniAuthData();
  const now = Date.now();
  // 1. Token válido com margem
  if (authData && authData.accessExpiresAt.getTime() > (now + BUFFER_TIME_MS)) {
    return authData.accessToken;
  }

  // 2. Access expirado, refresh ainda válido → tentar refresh
  if (authData &&
      authData.accessExpiresAt.getTime() <= (now + BUFFER_TIME_MS) &&
      authData.refreshExpiresAt.getTime() > (now + BUFFER_TIME_MS)) {

    console.log("🔄 Token expirado, a tentar refresh...");

    const res = await fetch("http://localhost:3000/api/moloniAccess/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: authData.refreshToken })
    });

    if (!res.ok) {
      console.warn("⚠️ Refresh falhou, a tentar login inicial...");
    } else {
      const data: MoloniTokenResponse | { error: any } = await res.json();

      // Se a API devolveu erro, ignorar
      if (!("error" in data)) {
        return data.access_token; // já está guardado na BD pela route
      }
    }
  }
  // 3. Refresh expirado → Login inicial
  console.log("🔑 A fazer login inicial...");
  const loginRes = await fetch("http://localhost:3000/api/moloniAccess/get", {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  if (!loginRes.ok) {
    throw new Error("❌ Falha total: não foi possível obter um novo token Moloni.");
  }

  const loginData: MoloniTokenResponse | { error: any } = await loginRes.json();

  if ("error" in loginData) {
    throw new Error("❌ Erro Moloni: " + JSON.stringify(loginData.error));
  }

  return loginData.access_token;
}

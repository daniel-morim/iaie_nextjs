"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authClient, Session} from "@/lib/auth.client";


interface SessionContextType {
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshSession: () => Promise<void>;
  error: string | null;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSession = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await authClient.getSession();

      if (resp?.data?.user) {
        const user = resp.data.user;

        setSession({ ...user });
        console.log("Eu sou a sessão existente", resp.data.user);
      } else {
        const anon = await authClient.signIn.anonymous();
        if (anon?.data?.user) {
          setSession(mapUserToSession(anon.data.user));
        } else {
          throw new Error(anon?.error?.message || "Erro na assinatura anônima");
        }
      }
    } catch (err) {
      console.error("Erro ao carregar sessão:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro desconhecido");
      }
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const isAuthenticated = session != null && session.isAnonymous === false;

  return (
    <SessionContext.Provider value={{ session, isLoading, isAuthenticated, refreshSession, error }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used within a SessionProvider");
  return context;
}


function mapUserToSession(user: any): Session {
  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    name: user.name,
    image: user.image ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    isAnonymous: user.isAnonymous ?? null, // aqui garantimos que existe
  };
}
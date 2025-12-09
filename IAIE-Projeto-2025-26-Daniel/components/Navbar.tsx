"use client";

import Link from "next/link";
import { NavigationMenu, NavigationMenuList } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { useSession } from "@/context/SessionContext";
import { authClient } from "@/lib/auth.client";

export default function NavbarDashboard() {
  const { session, isAuthenticated, isLoading, refreshSession } = useSession();

  const handleLogin = async () => {
    try {
      await authClient.signIn.social({ provider: "google" });
      await refreshSession();
    } catch (err) {
      console.error("Erro ao entrar com Google:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      await refreshSession();
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
    }
  };

   return (
    <nav className="w-full h-16 border-b shadow-sm bg-white flex items-center">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between px-4">

        {/* Entire Navbar Right & Left combined inside NavigationMenu */}
        <NavigationMenu viewport={false} className="flex-1">
          <NavigationMenuList className="flex w-full items-center justify-between">

            {/* --- Left Side: Brand --- */}
            <Link href="/" className="text-xl font-semibold">
              Stand Teste
            </Link>

            {/* --- Right Side --- */}
            <div className="flex items-center gap-4">
              {/* Loading shimmer */}
              {isLoading && (
                <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
              )}

              {/* Not Authenticated */}
              {!isLoading && !isAuthenticated && (
                <Button onClick={handleLogin}>Entrar</Button>
              )}

              {/* Authenticated */}
              {!isLoading && isAuthenticated && (
                <>
                  <span className="text-sm text-gray-700">
                    {session?.name ?? "Utilizador"}
                  </span>

                  <Button variant="outline" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              )}
            </div>
          </NavigationMenuList>
        </NavigationMenu>

      </div>
    </nav>
  );
}
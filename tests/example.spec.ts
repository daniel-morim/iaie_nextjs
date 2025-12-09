import { test, expect } from "@playwright/test";

test.describe.serial("Moloni API Flow (DB Token Management)", () => {
    let tokensFromLogin: any;
    let tokensAfterRefresh: any;

    test("1. Login real — /api/moloniAccess/get", async ({ request }) => {
        const res = await request.post("/api/moloniAccess/get");
        
        expect(res.status()).toBe(200);

        tokensFromLogin = await res.json();

        console.log("Tokens Login:", tokensFromLogin);

        expect(tokensFromLogin).toHaveProperty("access_token");
        expect(tokensFromLogin).toHaveProperty("refresh_token");
        expect(tokensFromLogin.expires_in).toBe(3600);
        expect(tokensFromLogin.refresh_expires_in).toBeDefined();
    });

    test("2. Refresh token — /api/moloniAccess/refresh", async ({ request }) => {
        const res = await request.post("/api/moloniAccess/refresh", {
            data: { refreshToken: tokensFromLogin.refresh_token }
        });

        expect(res.status()).toBe(200);

        tokensAfterRefresh = await res.json();

        console.log("Tokens Refresh:", tokensAfterRefresh);

        expect(tokensAfterRefresh).toHaveProperty("access_token");
        expect(tokensAfterRefresh).toHaveProperty("refresh_token");

        // Opcional: o token deve ser diferente (depende do provider)
        // expect(tokensAfterRefresh.access_token).not.toBe(tokensFromLogin.access_token);
    });

    test("3. Chamada a employees/getEmployees via Token Manager", async ({ request }) => {
        const res = await request.post("/api/moloni/employees/getEmployees");

        expect(res.status()).toBe(200);

        const data = await res.json();

        console.log("Resposta employees/getEmployees:", data);

        expect(Array.isArray(data)).toBe(true);

        if (data.length > 0) {
            expect(data[0]).toHaveProperty("salesman_id");
            expect(data[0]).toHaveProperty("name");
        }
    });
});

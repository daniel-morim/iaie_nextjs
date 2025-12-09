import { NextResponse } from "next/server";
import { getValidMoloniToken } from "@/lib/tokenManager";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const access_token = await getValidMoloniToken();
        const { email, name } = await req.json();
        const vat = "999999990";
        const userCount = await prisma.users.count({where: {role: "user"}});
        const number = `CLIENT-${userCount}`;
        const address = "Not Assigned";
        const city = "Not Assigned";
        const country_id = 1;
        const language_id = 1;
        const delivery_method_id = 1;
        const maturity_date_id = 2410657;
        const payment_method_id = 2987322;
        
        const company_id = process.env.MOLONI_COMPANY_ID;
        if (!access_token) {
            return NextResponse.json(
                { error: "Token de acesso não encontrado" },
                { status: 401 }
            );
        }

        // Variáveis de ambiente
        const apiUrl = process.env.MOLONI_API_URL ?? "https://api.moloni.pt/v1";

        if (!company_id) {
            return NextResponse.json(
                { error: "Variável de ambiente MOLONI_COMPANY_ID não definida" },
                { status: 500 }
            );
        }

        // Body obrigatório
        const body = {
            company_id: Number(company_id),
            vat,
            number,
            name,
            language_id,
            address,
            city,
            country_id,
            email,
            delivery_method_id,
            maturity_date_id,
            payment_method_id,
        };

        // Chamada ao endpoint
        const response = await fetch(`${apiUrl}/customers/insert/?access_token=${access_token}&json=true`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.ok ? 200 : 400 });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message ?? "Erro a registar cliente" },
            { status: 500 }
        );
    }
}

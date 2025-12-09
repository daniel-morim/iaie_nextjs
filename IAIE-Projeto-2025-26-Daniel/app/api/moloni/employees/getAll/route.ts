import { NextResponse } from "next/server";
import { getValidMoloniToken } from "@/lib/tokenManager";

export async function POST() {
    try {
        const access_token = await getValidMoloniToken();

        if (!access_token) {
            return NextResponse.json(
                { error: "Token de acesso não encontrado" },
                { status: 401 }
            );
        }

        // Variáveis de ambiente
        const company_id = process.env.MOLONI_COMPANY_ID;
        const apiUrl = process.env.MOLONI_API_URL ?? "https://api.moloni.pt/v1";

        if (!company_id) {
            return NextResponse.json(
                { error: "Variável de ambiente MOLONI_COMPANY_ID não definida" },
                { status: 500 }
            );
        }

        // Body obrigatório
        const body = {
            company_id: Number(company_id)
        };

        // Chamada ao endpoint
        const response = await fetch(`${apiUrl}/salesmen/getAll/?access_token=${access_token}&json=true`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.ok ? 200 : 400 });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message ?? "Erro a dar retrieve aos funcionários" },
            { status: 500 }
        );
    }
}

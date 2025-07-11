// app/api/create-service/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { serviceName } = await request.json();

    if (!serviceName || !serviceName.trim()) {
      return NextResponse.json(
        { error: 'Nome do serviço é obrigatório' },
        { status: 400 }
      );
    }

    // Payload para Supabase self-hosted
    const payload = {
      service_name: serviceName.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Fazer requisição direta para Supabase self-hosted
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/clinic_services`, {
      method: 'POST',
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY!}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro no Supabase:', response.status, errorText);
      return NextResponse.json(
        { error: `Erro ao criar serviço: ${response.status} - ${errorText}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    // Verificar se retornou dados
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return NextResponse.json(
        { error: 'Erro: resposta vazia do banco de dados' },
        { status: 500 }
      );
    }

    // Se retornou array, pegar primeiro item
    const serviceData = Array.isArray(data) ? data[0] : data;

    return NextResponse.json({
      success: true,
      id: serviceData.id,
      message: 'Serviço criado com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    return NextResponse.json(
      { error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Erro desconhecido'}` },
      { status: 500 }
    );
  }
}
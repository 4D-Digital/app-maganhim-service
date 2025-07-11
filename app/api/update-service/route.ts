// app/api/update-service/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const updateData = await request.json();
    const { id, ...fieldsToUpdate } = updateData;

    if (!id) {
      return NextResponse.json(
        { error: 'ID do serviço é obrigatório' },
        { status: 400 }
      );
    }

    // Adicionar timestamp de atualização
    const dataToUpdate = {
      ...fieldsToUpdate,
      updated_at: new Date().toISOString()
    };

    // Fazer requisição direta para Supabase self-hosted
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/clinic_services?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY!}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(dataToUpdate)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro no Supabase:', response.status, errorText);
      return NextResponse.json(
        { error: `Erro ao atualizar serviço: ${response.status} - ${errorText}` },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (!data || (Array.isArray(data) && data.length === 0)) {
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      );
    }

    // Se retornou array, pegar primeiro item
    const serviceData = Array.isArray(data) ? data[0] : data;

    return NextResponse.json({
      success: true,
      data: serviceData,
      message: 'Serviço atualizado com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    return NextResponse.json(
      { error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Erro desconhecido'}` },
      { status: 500 }
    );
  }
}
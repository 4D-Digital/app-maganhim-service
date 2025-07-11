// app/api/services/[id]/delete/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serviceId = params.id;
    
    console.log('=== DEBUG DELETAR SERVIÇO ===');
    console.log('ID do serviço:', serviceId);

    // Validar UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(serviceId)) {
      return NextResponse.json(
        { error: 'ID do serviço inválido' },
        { status: 400 }
      );
    }

    // Verificar se serviço existe antes de deletar
    const checkResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/clinic_services?id=eq.${serviceId}&select=id,service_name`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`
      }
    });

    if (!checkResponse.ok) {
      return NextResponse.json(
        { error: 'Erro ao verificar serviço' },
        { status: 500 }
      );
    }

    const existingServices = await checkResponse.json();
    
    if (!existingServices || existingServices.length === 0) {
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      );
    }

    const serviceName = existingServices[0].service_name;
    console.log('Serviço encontrado:', serviceName);

    // Deletar serviço do Supabase
    const deleteResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/clinic_services?id=eq.${serviceId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        'Prefer': 'return=minimal'
      }
    });

    console.log('Status delete Supabase:', deleteResponse.status);

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      console.error('Erro ao deletar:', errorText);
      return NextResponse.json(
        { error: 'Erro ao deletar serviço do banco de dados' },
        { status: 500 }
      );
    }

    console.log('Serviço deletado com sucesso');

    // TODO: Aqui poderia deletar imagens do MinIO também
    // const imageCleanup = await deleteServiceImages(serviceId);

    console.log('=== FIM DEBUG DELETAR ===');

    return NextResponse.json({
      success: true,
      message: `Serviço "${serviceName}" foi deletado com sucesso`,
      deletedService: {
        id: serviceId,
        name: serviceName
      }
    });

  } catch (error) {
    console.error('Erro ao deletar serviço:', error);
    return NextResponse.json(
      { error: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}` },
      { status: 500 }
    );
  }
}
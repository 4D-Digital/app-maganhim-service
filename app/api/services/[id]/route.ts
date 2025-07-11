// app/api/services/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';

// ✅ TIPAGEM CORRETA PARA NEXT.JS 15
interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // ✅ AWAIT nos params para Next.js 15
    const { id: serviceId } = await context.params;
    
    console.log('=== DEBUG BUSCAR SERVIÇO ===');
    console.log('ID do serviço:', serviceId);

    // Validar UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(serviceId)) {
      return NextResponse.json(
        { error: 'ID do serviço inválido' },
        { status: 400 }
      );
    }

    // Buscar serviço específico no Supabase
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/clinic_services?id=eq.${serviceId}&select=*`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`
      }
    });

    console.log('Status Supabase:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro Supabase:', errorText);
      return NextResponse.json(
        { error: 'Erro ao buscar serviço' },
        { status: 500 }
      );
    }

    const services = await response.json();
    console.log('Resultado Supabase:', services);

    if (!services || services.length === 0) {
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      );
    }

    const service = services[0];

    // Formatar dados do serviço
    const serviceData = {
      id: service.id,
      name: service.service_name,
      description: service.description || '',
      benefits: Array.isArray(service.benefits) ? service.benefits : [],
      procedureTime: service.procedure_time || '',
      imageUrls: Array.isArray(service.image_urls) ? service.image_urls : [],
      instagramLinks: Array.isArray(service.instagram_links) ? service.instagram_links : [],
      createdAt: service.created_at,
      updatedAt: service.updated_at
    };

    console.log('Serviço formatado:', {
      ...serviceData,
      description: serviceData.description ? '[DESCRIÇÃO PRESENTE]' : null
    });

    console.log('=== FIM DEBUG BUSCAR ===');

    return NextResponse.json({
      success: true,
      service: serviceData
    });

  } catch (error) {
    console.error('Erro ao buscar serviço:', error);
    return NextResponse.json(
      { error: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}` },
      { status: 500 }
    );
  }
}

// ✅ MÉTODO DELETE COM TIPAGEM CORRETA
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // ✅ AWAIT nos params para Next.js 15
    const { id: serviceId } = await context.params;
    
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
      console.error('Erro ao verificar serviço:', checkResponse.status);
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
    console.log('Serviço encontrado para deletar:', serviceName);

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
      console.error('Erro ao deletar do Supabase:', errorText);
      return NextResponse.json(
        { error: 'Erro ao deletar serviço do banco de dados' },
        { status: 500 }
      );
    }

    console.log('✅ Serviço deletado com sucesso do banco');
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
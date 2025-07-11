// app/api/services/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG LISTAR SERVIÇOS ===');

    // Buscar todos os serviços no Supabase
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/clinic_services?select=*&order=created_at.desc`, {
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
        { error: 'Erro ao buscar serviços' },
        { status: 500 }
      );
    }

    const services = await response.json();
    console.log('Serviços encontrados:', services.length);

    // Processar dados para a lista
    const servicesList = services.map((service: any) => ({
      id: service.id,
      name: service.service_name,
      description: service.description,
      hasDescription: !!service.description,
      benefitsCount: Array.isArray(service.benefits) ? service.benefits.length : 0,
      imagesCount: Array.isArray(service.image_urls) ? service.image_urls.length : 0,
      instagramCount: Array.isArray(service.instagram_links) ? service.instagram_links.length : 0,
      procedureTime: service.procedure_time,
      createdAt: service.created_at,
      updatedAt: service.updated_at
    }));

    console.log('=== FIM DEBUG LISTAR ===');

    return NextResponse.json({
      success: true,
      services: servicesList,
      total: servicesList.length
    });

  } catch (error) {
    console.error('Erro ao listar serviços:', error);
    return NextResponse.json(
      { error: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}` },
      { status: 500 }
    );
  }
}
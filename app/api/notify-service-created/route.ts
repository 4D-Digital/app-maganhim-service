// app/api/notify-service-created/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const serviceData = await request.json();

    console.log('=== DEBUG NOTIFY SERVICE ===');
    console.log('Dados do serviço recebidos:', {
      id: serviceData.id,
      name: serviceData.name,
      hasDescription: !!serviceData.description,
      benefitsCount: serviceData.benefits?.length || 0,
      imagesCount: serviceData.imageUrls?.length || 0,
      instagramLinksCount: serviceData.instagramLinks?.length || 0
    });

    // Validar dados obrigatórios
    if (!serviceData.id || !serviceData.name) {
      return NextResponse.json(
        { error: 'ID e nome do serviço são obrigatórios' },
        { status: 400 }
      );
    }

    // Preparar payload para N8N
    const payload = {
      event: 'service_created',
      timestamp: new Date().toISOString(),
      service: {
        id: serviceData.id,
        name: serviceData.name,
        description: serviceData.description,
        benefits: serviceData.benefits || [],
        procedure_time: serviceData.procedureTime,
        image_urls: serviceData.imageUrls || [],
        instagram_links: serviceData.instagramLinks || [],
        created_at: new Date().toISOString()
      },
      summary: {
        total_benefits: serviceData.benefits?.length || 0,
        total_images: serviceData.imageUrls?.length || 0,
        total_instagram_links: serviceData.instagramLinks?.length || 0,
        has_description: !!serviceData.description,
        has_procedure_time: !!serviceData.procedureTime
      },
      metadata: {
        source: 'clinic_service_form',
        version: '1.0',
        user_agent: request.headers.get('user-agent') || 'unknown'
      }
    };

    console.log('Payload para N8N:', {
      ...payload,
      service: {
        ...payload.service,
        description: payload.service.description ? '[DESCRIÇÃO PRESENTE]' : null
      }
    });

    // Verificar se webhook está configurado
    if (!process.env.N8N_WEBHOOK_SERVICE_CREATED) {
      console.warn('N8N_WEBHOOK_SERVICE_CREATED não configurado');
      return NextResponse.json(
        { 
          success: true, 
          message: 'Webhook N8N não configurado, mas serviço foi cadastrado com sucesso',
          notificationSent: false
        }
      );
    }

    // Enviar para N8N
    const n8nResponse = await fetch(process.env.N8N_WEBHOOK_SERVICE_CREATED, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ClinicServiceForm/1.0'
      },
      body: JSON.stringify(payload)
    });

    console.log('Status resposta N8N:', n8nResponse.status);

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('Erro ao notificar N8N:', errorText);
      
      // Não falha o cadastro se a notificação der erro
      return NextResponse.json({
        success: true,
        message: 'Serviço cadastrado com sucesso, mas houve erro na notificação',
        notificationSent: false,
        error: `N8N retornou status ${n8nResponse.status}`
      });
    }

    const n8nData = await n8nResponse.json();
    console.log('Resposta N8N:', n8nData);

    console.log('=== FIM DEBUG NOTIFY ===');

    return NextResponse.json({
      success: true,
      message: 'Serviço cadastrado e notificação enviada com sucesso',
      notificationSent: true,
      n8nResponse: n8nData
    });

  } catch (error) {
    console.error('Erro ao notificar N8N:', error);
    
    // Não falha o cadastro se a notificação der erro
    return NextResponse.json({
      success: true,
      message: 'Serviço cadastrado com sucesso, mas houve erro na notificação',
      notificationSent: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
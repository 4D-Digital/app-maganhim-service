// api/generate-benefits/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { id, servico, complemento } = await request.json();

    console.log('=== DEBUG GENERATE BENEFITS ===');
    console.log('Payload recebido:', { id, servico, complemento });

    if (!id || !servico) {
      return NextResponse.json(
        { error: 'ID e nome do serviço são obrigatórios' },
        { status: 400 }
      );
    }

    // Payload para n8n
    const payload = {
      id,
      servico,
      ...(complemento && { complemento }),
      timestamp: new Date().toISOString()
    };

    console.log('Payload enviado para n8n:', payload);
    console.log('URL do webhook:', process.env.N8N_WEBHOOK_BENEFITS);

    // Chamar webhook do n8n para benefícios
    const response = await fetch(process.env.N8N_WEBHOOK_BENEFITS!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    console.log('Status da resposta n8n:', response.status);
    console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro no webhook n8n:', response.status, errorText);
      return NextResponse.json(
        { error: `Erro na comunicação com n8n: ${response.status} - ${errorText}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log('Resposta bruta do n8n:', JSON.stringify(data, null, 2));

    // N8N retorna array: [{ "benefits": [...], "success": true }]
    let benefits: string[] = [];
    let responseData = data;

    // Se retornou array, pegar primeiro item
    if (Array.isArray(data) && data.length > 0) {
      console.log('Resposta é array, pegando primeiro item');
      responseData = data[0];
    } else {
      console.log('Resposta não é array ou está vazio');
    }

    console.log('ResponseData após processamento:', responseData);

    if (responseData.benefits && Array.isArray(responseData.benefits)) {
      console.log('Encontrou benefits como array:', responseData.benefits);
      benefits = responseData.benefits;
    } else if (responseData.benefits && typeof responseData.benefits === 'string') {
      console.log('Encontrou benefits como string, convertendo para array:', responseData.benefits);
      // Benefits veio como string separada por vírgulas
      benefits = responseData.benefits
        .split(',')
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0);
    } else if (responseData.content) {
      console.log('Não encontrou benefits, tentando content:', responseData.content);
      // Fallback: dividir por linhas se não vier como array
      benefits = responseData.content
        .split('\n')
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0);
    } else {
      console.log('Não encontrou nem benefits nem content');
      console.log('Chaves disponíveis:', Object.keys(responseData));
    }

    // Garantir que retorna array válido
    benefits = benefits.filter(b => b && b.trim().length > 0);

    console.log('Benefits finais extraídos:', benefits);
    console.log('=== FIM DEBUG ===');

    return NextResponse.json({
      success: true,
      benefits: benefits,
      debug: {
        originalResponse: data,
        processedData: responseData,
        extractedBenefits: benefits
      }
    });

  } catch (error) {
    console.error('Erro ao gerar benefícios:', error);
    return NextResponse.json(
      { error: `Erro ao gerar benefícios via IA: ${error instanceof Error ? error.message : 'Erro desconhecido'}` },
      { status: 500 }
    );
  }
}
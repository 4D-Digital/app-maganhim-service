import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { id, servico, complemento } = await request.json();

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

    // Chamar webhook do n8n
    const response = await fetch(process.env.N8N_WEBHOOK_DESCRIPTION!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error('Erro no webhook n8n:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Erro na comunicação com n8n: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();

    // N8N deve retornar algo como: { "description": "texto da descrição" }
    // ou { "content": "texto da descrição" }
    return NextResponse.json({
      success: true,
      description: data.description || data.content || data.output,
      content: data.description || data.content || data.output
    });

  } catch (error) {
    console.error('Erro ao gerar descrição:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar descrição via IA' },
      { status: 500 }
    );
  }
}
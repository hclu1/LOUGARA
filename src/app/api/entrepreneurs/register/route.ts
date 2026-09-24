import { NextRequest, NextResponse } from 'next/server';
import {
  registerEntrepreneur,
  getRegisteredEntrepreneurs,
} from '@/features/entrepreneurs/service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entrepreneur = await registerEntrepreneur(body);

    return NextResponse.json({
      success: true,
      message: 'Inscription validée avec succès dans la base de données Lougara.',
      entrepreneur,
    });
  } catch (err: any) {
    console.error('Erreur API inscription entrepreneur :', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Données d\'inscription invalides.',
      },
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    const entrepreneurs = await getRegisteredEntrepreneurs();
    return NextResponse.json({
      success: true,
      count: entrepreneurs.length,
      entrepreneurs,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

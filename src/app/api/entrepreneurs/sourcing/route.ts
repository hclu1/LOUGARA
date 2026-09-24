import { NextRequest, NextResponse } from 'next/server';
import {
  submitSourcingRequest,
  getSourcingRequests,
} from '@/features/entrepreneurs/service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const request = await submitSourcingRequest(body);

    return NextResponse.json({
      success: true,
      message: 'Appel d\'offres / besoin de sourcing publié avec succès.',
      request,
    });
  } catch (err: any) {
    console.error('Erreur API sourcing request :', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Données du besoin invalides.',
      },
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    const requests = await getSourcingRequests();
    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { contactSupplier, getInquiries } from '@/features/entrepreneurs/service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const inquiry = await contactSupplier(body);

    return NextResponse.json({
      success: true,
      message: 'Demande de mise en relation transmise au fournisseur.',
      inquiry,
    });
  } catch (err: any) {
    console.error('Erreur API contact fournisseur :', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Impossible d\'envoyer la demande de contact.',
      },
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    const inquiries = await getInquiries();
    return NextResponse.json({
      success: true,
      inquiries,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

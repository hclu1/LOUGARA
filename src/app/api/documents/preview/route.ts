import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, BUCKET_NAME } from '@/lib/supabase-storage';
import path from 'path';
import fs from 'fs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileParam = searchParams.get('file');
    const nameParam = searchParams.get('name') || 'Document_Original.jpg';

    // 0. Si le paramètre est une URL HTTP/HTTPS complète
    if (fileParam && (fileParam.startsWith('http://') || fileParam.startsWith('https://'))) {
      return NextResponse.redirect(fileParam);
    }

    const sanitizedPath = (fileParam || nameParam).replace(/^\/+/, '');
    const fileNameOnly = path.basename(sanitizedPath);

    // Helper pour retourner une réponse binaire d'image/PDF
    const serveFileBuffer = (buffer: Buffer, filePathOrName: string) => {
      const ext = path.extname(filePathOrName).toLowerCase();
      let contentType = 'image/jpeg';
      if (ext === '.pdf') contentType = 'application/pdf';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.webp') contentType = 'image/webp';
      else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `inline; filename="${fileNameOnly}"`,
          'Cache-Control': 'public, max-age=86400',
        },
      });
    };

    // 1. Tenter de récupérer le fichier ORIGINAL sur Supabase Storage (bucket kyb-documents)
    if (fileParam) {
      const storagePathsToTry = [
        sanitizedPath,
        fileNameOnly,
        `uploads/${fileNameOnly}`,
        `uploads/${sanitizedPath}`,
        `kbis/${fileNameOnly}`,
        `kbis/${sanitizedPath}`,
      ];

      for (const storagePath of storagePathsToTry) {
        try {
          const { data: fileData, error } = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .download(storagePath);

          if (!error && fileData) {
            const arrayBuffer = await fileData.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            return serveFileBuffer(buffer, fileNameOnly);
          }
        } catch (storageErr) {
          // Ignorer et passer au disque local
        }
      }
    }

    // 2. Recherche du fichier physique sur le disque local (spécimens originaux & uploads)
    const possibleLocalPaths = [
      path.join(process.cwd(), 'docs', 'kyb-specimens', fileNameOnly),
      path.join(process.cwd(), 'docs', 'kyb-specimens', sanitizedPath),
      path.join(process.cwd(), 'public', 'uploads', 'kbis', fileNameOnly),
      path.join(process.cwd(), 'public', 'uploads', 'kbis', sanitizedPath),
      path.join(process.cwd(), 'public', 'uploads', fileNameOnly),
      path.join(process.cwd(), 'public', 'uploads', sanitizedPath),
      path.join(process.cwd(), 'public', sanitizedPath),
      path.join(process.cwd(), sanitizedPath),
    ];

    for (const targetPath of possibleLocalPaths) {
      if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
        const fileBuffer = fs.readFileSync(targetPath);
        return serveFileBuffer(fileBuffer, targetPath);
      }
    }

    // 3. Fallback d'image originale scannée correspondant au document (Afrique OHADA / Maghreb)
    const lowerSearch = `${sanitizedPath} ${nameParam}`.toLowerCase();
    let specimenName = 'rc_maroc_atlas_commercial_1789907835086.jpg';

    if (lowerSearch.includes('senegal') || lowerSearch.includes('dakar') || lowerSearch.includes('ninea')) {
      specimenName = lowerSearch.includes('ninea')
        ? 'ninea_senegal_sahel_agro_1789907499261.jpg'
        : 'rccm_senegal_sahel_agro_1789907488588.jpg';
    } else if (lowerSearch.includes('ivoire') || lowerSearch.includes('abidjan') || lowerSearch.includes('ncc')) {
      specimenName = lowerSearch.includes('ncc')
        ? 'ncc_ci_ivoire_trading_1789907525174.jpg'
        : 'rccm_ci_ivoire_trading_1789907510027.jpg';
    } else if (lowerSearch.includes('cameroun') || lowerSearch.includes('douala') || lowerSearch.includes('niu')) {
      specimenName = lowerSearch.includes('niu')
        ? 'niu_cameroun_agro_trade_1789907767960.jpg'
        : 'rccm_cameroun_agro_trade_1789907757673.jpg';
    } else if (lowerSearch.includes('benin') || lowerSearch.includes('cotonou') || lowerSearch.includes('ifu')) {
      specimenName = lowerSearch.includes('ifu')
        ? 'ifu_benin_import_export_1789907826351.jpg'
        : 'rccm_benin_import_export_1789907814902.jpg';
    } else if (lowerSearch.includes('rdc') || lowerSearch.includes('kinshasa') || lowerSearch.includes('congo')) {
      specimenName = 'rccm_rdc_congo_mining_1789907778722.jpg';
    }

    const specimenPath = path.join(process.cwd(), 'docs', 'kyb-specimens', specimenName);
    if (fs.existsSync(specimenPath)) {
      const fileBuffer = fs.readFileSync(specimenPath);
      return serveFileBuffer(fileBuffer, specimenName);
    }

    // 4. Si aucun spécimen d'image n'est présent, renvoyer une erreur 404 propre
    return NextResponse.json(
      { error: 'Document original introuvable.' },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erreur d\'accès au document binaire : ' + error.message },
      { status: 500 }
    );
  }
}

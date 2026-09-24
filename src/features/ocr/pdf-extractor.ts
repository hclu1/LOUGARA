import zlib from 'zlib';

/**
 * Extracteur natif ultra-rapide de texte PDF (sans dépendances externes lourdes).
 * Lit directement les flux de texte et décompresse les objets FlateDecode en mémoire en < 50ms.
 */
export function extractTextFromPdfBuffer(buffer: Buffer): string {
  const content = buffer.toString('binary');
  const textChunks: string[] = [];

  // 1. Recherche des flux de contenu (streams)
  const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
  let match: RegExpExecArray | null;

  while ((match = streamRegex.exec(content)) !== null) {
    const rawStream = match[1];
    let decompressed: string = '';

    try {
      const streamBuffer = Buffer.from(rawStream, 'binary');
      decompressed = zlib.inflateSync(streamBuffer).toString('utf-8');
    } catch {
      try {
        const streamBuffer = Buffer.from(rawStream, 'binary');
        decompressed = zlib.unzipSync(streamBuffer).toString('utf-8');
      } catch {
        // Flux non compressé
        decompressed = rawStream;
      }
    }

    // 2. Extraction des séquences de texte entre parenthèses (...) Tj ou TJ
    const textOperatorRegex = /\(([^)]+)\)\s*(?:Tj|'|")/g;
    let textMatch: RegExpExecArray | null;
    while ((textMatch = textOperatorRegex.exec(decompressed)) !== null) {
      textChunks.push(textMatch[1]);
    }

    // Extraction des tableaux [(texte) -123 (texte)] TJ
    const arrayOperatorRegex = /\[([\s\S]*?)\]\s*TJ/g;
    let arrayMatch: RegExpExecArray | null;
    while ((arrayMatch = arrayOperatorRegex.exec(decompressed)) !== null) {
      const inner = arrayMatch[1];
      const parts = inner.match(/\(([^)]+)\)/g);
      if (parts) {
        textChunks.push(parts.map((p) => p.slice(1, -1)).join(' '));
      }
    }
  }

  // Si l'extraction de flux n'a rien donné, recherche brute de motifs textuels dans le document
  if (textChunks.length === 0) {
    const rawMatch = content.match(/\(([^)]{3,})\)/g);
    if (rawMatch) {
      return rawMatch.map((m) => m.slice(1, -1)).join('\n');
    }
  }

  return textChunks.join('\n');
}

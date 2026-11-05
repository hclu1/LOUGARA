import zlib from 'zlib';

/**
 * Décode les séquences d'échappement PDF octales (\340 -> à, \351 -> é)
 * et nettoie les octets nuls UTF-16BE/LE.
 */
function decodePdfOctalAndUtf16(str: string): string {
  let clean = str;
  if (clean.includes('\u0000')) {
    clean = clean.replace(/\u0000/g, '');
  }
  clean = clean.replace(/\\([0-7]{1,3})/g, (_, oct) => {
    const code = parseInt(oct, 8);
    return Buffer.from([code]).toString('latin1');
  });
  clean = clean.replace(/\\([()\\\/])/g, '$1');
  return clean.trim();
}

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
      decompressed = zlib.inflateSync(streamBuffer).toString('latin1');
    } catch {
      try {
        const streamBuffer = Buffer.from(rawStream, 'binary');
        decompressed = zlib.unzipSync(streamBuffer).toString('latin1');
      } catch {
        // Flux non compressé
        decompressed = rawStream;
      }
    }

    // 2. Extraction des séquences de texte entre parenthèses (...) Tj ou TJ
    const textOperatorRegex = /\(([^)]+)\)\s*(?:Tj|'|")/g;
    let textMatch: RegExpExecArray | null;
    while ((textMatch = textOperatorRegex.exec(decompressed)) !== null) {
      const decoded = decodePdfOctalAndUtf16(textMatch[1]);
      if (decoded) {
        textChunks.push(decoded);
      }
    }

    // Extraction des tableaux [(texte) -123 (texte)] TJ
    const arrayOperatorRegex = /\[([\s\S]*?)\]\s*TJ/g;
    let arrayMatch: RegExpExecArray | null;
    while ((arrayMatch = arrayOperatorRegex.exec(decompressed)) !== null) {
      const inner = arrayMatch[1];
      const parts = inner.match(/\(([^)]+)\)/g);
      if (parts) {
        const joined = parts
          .map((p) => decodePdfOctalAndUtf16(p.slice(1, -1)))
          .filter(Boolean)
          .join(' ');
        if (joined) {
          textChunks.push(joined);
        }
      }
    }
  }

  // Si l'extraction de flux n'a rien donné, recherche brute de motifs textuels dans le document
  if (textChunks.length === 0) {
    const rawMatch = content.match(/\(([^)]{3,})\)/g);
    if (rawMatch) {
      return rawMatch
        .map((m) => decodePdfOctalAndUtf16(m.slice(1, -1)))
        .filter(Boolean)
        .join('\n');
    }
  }

  return textChunks.join('\n');
}

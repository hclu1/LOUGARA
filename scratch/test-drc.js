const { parseKbisOcrText } = require('../src/features/ocr/kbis-parser');

const rawText = `RÉPUBLIQUE DÉMOCRATIQUE DU CONGO
MINISTÈRE DE L'ÉCONOMIE NATIONALE
ATTESTATION D'IDENTIFICATION
NATIONALE (ID. NAT.)
Délivrée à la société: Congo Mining & Logistics SARL
Numéro d'Identification Nationale (ID. NAT.): 01-93-N48152B
Forme Juridique: Societé à Responsabilité Limitée (SARL)
Lieu de Délivrance: Kinshasa, RDC
Date de Délivrance: 21 Octobre 2023`;

console.log('PARSED RESULT:', parseKbisOcrText(rawText));

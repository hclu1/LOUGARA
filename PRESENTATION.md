# LOUGARA — Plateforme B2B de Sourcing & Fournisseurs Vérifiés (Afrique • Europe)

> **LOUGARA** est une plateforme B2B de mise en relation de confiance connectant les entrepreneurs, acheteurs et négociants avec des grossistes et producteurs certifiés d'Afrique et d'Europe.

---

## 📋 Sommaire

1. [Vision & Modèle d'Affaires](#1-vision--modèle-daffaires)
2. [Fonctionnalités Principales](#2-fonctionnalités-principales)
3. [Système de Vérification & Audit KYB](#3-système-de-vérification--audit-kyb)
4. [Espaces Utilisateurs & Rôles](#4-espaces-utilisateurs--rôles)
5. [Architecture Technique & Stack](#5-architecture-technique--stack)
6. [Référencement & Visibilité (SEO)](#6-référencement--visibilité-seo)

---

## 1. Vision & Modèle d'Affaires

Le négoce transfrontalier entre l'Afrique et l'Europe souffre souvent d'un manque de transparence, de risques de fraude et de la difficulté à vérifier l'existence légale des partenaires commerciaux.

**LOUGARA résout ce problème** en introduisant une couche de confiance matérielle : **chaque fournisseur doit être audité sur pièces juridiques officielles (RCCM, Kbis, NIF) avant d'obtenir le statut certifié.**

---

## 2. Fonctionnalités Principales

### 🛒 A. Catalogue Produit B2B & Recherche Avancée
- **Exploration par secteur** : Textile & Wax, Cosmétiques Bio & Beauté, Agroalimentaire & Denrées, Équipements & Matériel professionnel.
- **Filtres de précision** : Filtrage par pays d'origine (Guinée, Sénégal, Côte d'Ivoire, Cameroun, France, etc.), par Quantité Minimale de Commande (MOQ) et par fourchettes de prix.
- **Demande de Devis Directe** : Prise de contact directe et demandes de cotation personnalisées auprès des grossistes certifiés.

### 🛡️ B. Badge « Fournisseur Vérifié Lougara »
- Attribution d'un badge officiel de confiance visible sur les fiches produits et profils d'entreprises.
- Garantie pour l'acheteur d'interagir avec une structure légalement enregistrée au Registre du Commerce.

### ✉️ C. Messagerie B2B & Négociation
- Système de messagerie intégrée permettant les échanges directs entre acheteurs et grossistes.
- Historique des demandes de devis et suivi des négociations.

---

## 3. Système de Vérification & Audit KYB

Le cœur de sécurité de LOUGARA repose sur une technologie hybride d'**OCR (Reconnaissance Optique de Caractères)** et de validation humaine :

1. **Extraction Automatique OCR** :
   - Analyse automatique des documents importés (PDF / Images) grâce à `Tesseract.js` et `pdf-parse`.
   - Extraction intelligente du numéro de SIREN/SIRET (Kbis France) ou du numéro RCCM (Afrique de l'Ouest / Centrale), du nom du dirigeant et des dates d'immatriculation.
2. **Espace de Modération Administrateur** (`/admin/verifications`) :
   - Dashboard réservé à l'équipe de contrôle pour vérifier visuellement les pièces jointes, la concordance des signatures et la conformité fiscale.
   - Validation en 1 clic (`VERIFIED`) ou rejet avec motif (`REJECTED`).

---

## 4. Espaces Utilisateurs & Rôles

| Rôle | Description & Capacités |
| :--- | :--- |
| **Entrepreneur / Acheteur** | Explore le catalogue, recherche des fournisseurs certifiés, demande des devis directs et gère ses commandes. |
| **Grossiste / Fournisseur** | Publie son catalogue produit, définit ses MOQ/prix, soumet ses pièces officielles (RCCM/Kbis) et reçoit des opportunités d'affaires. |
| **Modérateur / Administrateur** | Audite les dossiers KYB, attribue les badges de vérification et gère la conformité globale de la plateforme. |

---

## 5. Architecture Technique & Stack

- **Framework Web** : [Next.js 16 (App Router)](https://nextjs.org/) avec Server Components et API Routes.
- **Langage** : [TypeScript](https://www.typescriptlang.org/) (Typage strict de bout en bout).
- **Style & UI** : [Tailwind CSS](https://tailwindcss.com/) avec design charte *Midnight Obsidian Navy & Gold Métallique*.
- **Base de Données & ORM** : [Prisma ORM](https://www.prisma.io/) & PostgreSQL / Supabase.
- **Stockage de Fichiers** : Supabase Storage (pour les pièces justificatives et images produits).
- **OCR & Parsing** : `Tesseract.js` & `pdf-parse`.
- **Tests Unitaires** : [Vitest](https://vitest.dev/).

---

## 6. Référencement & Visibilité (SEO)

- **Structure 1 Page = 1 Intention** : Balises Meta et OpenGraph uniques pour chaque section (`/catalogue`, `/entrepreneurs`, `/devenir-fournisseur`, `/verification`, `/tarifs`).
- **Sitemap Dynamique** : Fichier `sitemap.xml` mis à jour automatiquement pour l'indexation Google Search Console et Bing Webmasters.
- **Optimisation Longue Traîne** : Positionnement sur des requêtes ciblées B2B (*"fournisseur beurre de karité Sénégal"*, *"grossiste tissu wax export"*, *"vérification RCCM Kbis fournisseur Afrique"*).

---

© 2026 **LOUGARA** — Tous droits réservés.

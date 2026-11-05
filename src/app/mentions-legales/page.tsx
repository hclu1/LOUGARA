import React from 'react';
import Link from 'next/link';
import { Shield, Building, Globe, Server, FileText, Mail, ArrowLeft } from 'lucide-react';
import { APP_VERSION_LABEL } from '@/version';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Mentions Légales | Lougara B2B',
  description: 'Mentions légales officielles et politique de confidentialité de la plateforme Lougara B2B éditée par App à la Carte — Hervé CHAMPAGNE EI.',
};

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-[#070C1B] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation retour */}
        <div>
          <Link
            href="/connexion"
            className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à l&apos;espace connexion</span>
          </Link>
        </div>

        {/* En-tête */}
        <div className="glass-card gold-glow-border p-8 rounded-3xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center text-slate-950 font-black text-2xl shadow-md">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Mentions Légales &amp; Confidentialité
              </h1>
              <p className="text-xs text-amber-400 font-mono mt-1">
                Plateforme Lougara B2B — {APP_VERSION_LABEL}
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Conformément aux dispositions des articles 6-III et 19 de la Loi n° 2004-575 du 21 juin 2004 pour la Confiance dans l&apos;Économie Numérique (LCEN), ainsi qu&apos;au Règlement Général sur la Protection des Données (RGPD 2016/679), les présentes mentions légales s&apos;appliquent à tout utilisateur accédant à la plateforme Lougara.
          </p>
        </div>

        {/* Section 1 : Éditeur du site */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4 border border-slate-800">
          <h2 className="text-lg font-bold text-[#E5A93C] flex items-center gap-2.5">
            <Building className="w-5 h-5 text-amber-400 shrink-0" />
            <span>1. Éditeur de la Plateforme Lougara</span>
          </h2>
          <div className="text-sm text-slate-300 space-y-2 leading-relaxed">
            <p><strong className="text-white">Nom commercial :</strong> App à la Carte</p>
            <p><strong className="text-white">Entrepreneur :</strong> Hervé CHAMPAGNE</p>
            <p><strong className="text-white">Forme juridique :</strong> Entrepreneur Individuel (EI)</p>
            <p><strong className="text-white">Adresse professionnelle :</strong> 173 rue de Courcelles, 75017 Paris, France</p>
            <p><strong className="text-white">Domiciliation :</strong> HelloDom (SIREN : 878 831 312)</p>
            <p><strong className="text-white">SIREN :</strong> 132 021 098</p>
            <p><strong className="text-white">SIRET :</strong> 132 021 098 00018</p>
            <p><strong className="text-white">Immatriculation RNE :</strong> 26 octobre 2026 (Début d&apos;activité : 21/10/2026)</p>
            <p><strong className="text-white">Activité / Code APE :</strong> 6201Z - Programmation informatique</p>
            <p><strong className="text-white">Régime fiscal &amp; TVA :</strong> Micro-BIC, Franchise en base de TVA (mention légale : <em>« TVA non applicable, article 293 B du CGI »</em>)</p>
            <p><strong className="text-white">Directeur de la publication :</strong> Hervé CHAMPAGNE (EI)</p>
            <p className="flex items-center gap-2 pt-1">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <span><strong className="text-white">Contact officiel :</strong> <a href="mailto:contact@appalacarte.fr" className="text-amber-400 underline hover:text-amber-300">contact@appalacarte.fr</a></span>
            </p>
          </div>
        </div>

        {/* Section 2 : Hébergement & Noms de domaine */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4 border border-slate-800">
          <h2 className="text-lg font-bold text-[#E5A93C] flex items-center gap-2.5">
            <Server className="w-5 h-5 text-amber-400 shrink-0" />
            <span>2. Hébergement Web &amp; Infrastructure Technique</span>
          </h2>
          <div className="text-sm text-slate-300 space-y-3 leading-relaxed">
            <div>
              <p className="text-white font-semibold">Hébergement applicatif par défaut :</p>
              <p>Vercel Inc. — 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis d&apos;Amérique.</p>
            </div>
            <div>
              <p className="text-white font-semibold">Gestion du nom de domaine &amp; DNS :</p>
              <p>OVHcloud (OVH SAS) — 2 rue Kellermann, 59100 Roubaix, France.</p>
            </div>
          </div>
        </div>

        {/* Section 3 : Objet de la Plateforme Lougara B2B */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4 border border-slate-800">
          <h2 className="text-lg font-bold text-[#E5A93C] flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-amber-400 shrink-0" />
            <span>3. Objet de la Plateforme &amp; Sécurisation des Relations B2B</span>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Lougara est une plateforme technologique professionnelle dédiée à la mise en relation sécurisée d&apos;acheteurs/entrepreneurs et de grossistes/fournisseurs vérifiés en Afrique et en Europe.
            La plateforme intègre un protocole d&apos;audit documentaire KYB (Know Your Business) basé sur les registres commerciaux officiels (Greffe Kbis en France, OHADA RCCM en Afrique de l&apos;Ouest) ainsi que le contrôle d&apos;identité des dirigeants.
          </p>
        </div>

        {/* Section 4 : Protection des Données Personnelles (RGPD) */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4 border border-slate-800">
          <h2 className="text-lg font-bold text-[#E5A93C] flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-amber-400 shrink-0" />
            <span>4. Données Personnelles, Authentification &amp; Confidentialité</span>
          </h2>
          <div className="text-sm text-slate-300 space-y-3 leading-relaxed">
            <p>
              Les données recueillies lors de l&apos;inscription et de la connexion (adresses e-mail professionnelles, raisons sociales, justificatifs d&apos;identité et registres d&apos;entreprises) sont strictement destinées au fonctionnement du service B2B Lougara et à la vérification d&apos;authenticité des entreprises membres.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li><strong className="text-white">Sécurité des mots de passe :</strong> Tous les mots de passe sont hachés cryptographiquement via l&apos;algorithme scrypt avec sel cryptographique individuel et vérification en temps constant. Aucun mot de passe en clair n&apos;est enregistré ou visible.</li>
              <li><strong className="text-white">Aucune revente de données :</strong> Lougara et App à la Carte ne commercialisent, ne cèdent ni ne louent aucune donnée à des tiers publicitaires.</li>
              <li><strong className="text-white">Droits de l&apos;utilisateur :</strong> Conformément à la réglementation RGPD, tout membre dispose d&apos;un droit d&apos;accès, de rectification et d&apos;effacement de ses données personnelles par simple demande écrite adressée à <a href="mailto:contact@appalacarte.fr" className="text-amber-400 underline">contact@appalacarte.fr</a>.</li>
            </ul>
          </div>
        </div>

        {/* Section 5 : Propriété intellectuelle */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4 border border-slate-800">
          <h2 className="text-lg font-bold text-[#E5A93C] flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-amber-400 shrink-0" />
            <span>5. Propriété Intellectuelle</span>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            L&apos;ensemble des éléments composant la plateforme Lougara (code source, algorithmes de vérification KYB, marque, logotype, charte graphique et textes) sont la propriété exclusive de l&apos;éditeur App à la Carte — Hervé CHAMPAGNE (EI). Toute reproduction, représentation, modification ou diffusion non autorisée constitue une contrefaçon sanctionnée par le Code de la Propriété Intellectuelle.
          </p>
        </div>

        {/* Pied de page spécifique */}
        <div className="text-center pt-4">
          <p className="text-xs text-slate-400">
            App à la Carte — Hervé CHAMPAGNE EI | SIREN : 132 021 098 | {APP_VERSION_LABEL} | Mentions légales | Contact : <a href="mailto:contact@appalacarte.fr" className="text-amber-400 underline">contact@appalacarte.fr</a>
          </p>
        </div>
      </div>
    </div>
  );
}

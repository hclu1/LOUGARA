import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  Building2,
  ArrowRight,
  TrendingUp,
  Award,
  Globe2,
  Sparkles,
} from 'lucide-react';
import { BadgeVerified } from '@/components/BadgeVerified';

export default function HomePage() {
  return (
    <div className="space-y-24 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100/70 text-emerald-800 border border-emerald-300 shadow-sm">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Plateforme B2B Sécurisée Afrique &bull; Europe
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Trouvez des fournisseurs{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                professionnels et vérifiés
              </span>{' '}
              en Afrique et en Europe.
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Lougara résout le défi du sourcing transfrontalier en contrôlant l&apos;immatriculation légale de chaque fournisseur. Achetez en gros en toute sérénité.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/catalogue"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg hover:shadow-emerald-600/25 transition-all duration-200"
              >
                Explorer le Catalogue B2B
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/admin/verifications"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-sm transition-all"
              >
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Dossier de Vérification (KYB)
              </Link>
            </div>

            {/* TRUST SIGNALS */}
            <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-left border-t border-slate-200 mt-10">
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100">
                <p className="text-2xl font-black text-slate-900">100%</p>
                <p className="text-xs font-medium text-slate-500">Entreprises contrôlées</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100">
                <p className="text-2xl font-black text-emerald-600">0%</p>
                <p className="text-xs font-medium text-slate-500">Faux profils tolérés</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100">
                <p className="text-2xl font-black text-slate-900">Corridor</p>
                <p className="text-xs font-medium text-slate-500">France &bull; Afrique Ouest</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100">
                <p className="text-2xl font-black text-slate-900">Direct</p>
                <p className="text-xs font-medium text-slate-500">Devis & messagerie</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LE PILIER CONFIANCE / VÉRIFICATION */}
      <section id="confiance" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Award className="w-4 h-4" />
              Avantage Concurrentiel Exclusif
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              La confiance n&apos;est pas une promesse, c&apos;est une procédure de vérification.
            </h2>

            <p className="text-slate-300 text-base leading-relaxed">
              Pour chaque fournisseur portant le badge{' '}
              <BadgeVerified className="bg-emerald-900/60 border-emerald-700 text-emerald-300 ml-1 inline-flex" />,
              l&apos;équipe Lougara examine manuellement :
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">Registre du Commerce (RCCM / Kbis)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Vérification de l&apos;existence légale et active au greffe.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">Identité du Dirigeant</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Pièce d&apos;identité officielle du représentant légal contrôlée.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">Identification Fiscale (NINEA / NIF)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Conformité fiscale attestée pour l&apos;exportation et la facturation.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">Coordonnées Professionnelles</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Ligne directe, localisation des entrepôts et réactivité testée.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTEURS PRIORITAIRES DE LANCEMENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl font-bold text-slate-900">Secteurs Ciblés au Lancement</h2>
          <p className="text-slate-600 text-sm">
            Conformément à nos recommandations stratégiques, nous concentrons nos premiers 30 fournisseurs dans des niches à forte demande Afrique-Europe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl mb-4 group-hover:bg-amber-100 transition-colors">
              🧴
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Cosmétique & Beauté Naturelle</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Beurre de karité brut ou raffiné, huile pure de baobab, nigelle, moringa, savons artisanaux aux normes CE.
            </p>
            <Link
              href="/catalogue?category=Cosmétique"
              className="text-xs font-semibold text-emerald-600 flex items-center gap-1 group-hover:gap-2 transition-all"
            >
              Voir les fournisseurs cosmétiques <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl mb-4 group-hover:bg-blue-100 transition-colors">
              🧵
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Textile, Coton & Tissus Wax</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Grossistes de coton biologique, tissus wax authentiques, confection sur-mesure et ateliers de confection certifiés.
            </p>
            <Link
              href="/catalogue?category=Textile"
              className="text-xs font-semibold text-emerald-600 flex items-center gap-1 group-hover:gap-2 transition-all"
            >
              Voir les fournisseurs textiles <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl mb-4 group-hover:bg-emerald-100 transition-colors">
              🌱
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Agroalimentaire & Épices Nobles</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Fèves de cacao sélectionnées, café grand cru, noix de cajou brutes ou transformées, vanille et épices exotiques.
            </p>
            <Link
              href="/catalogue?category=Agroalimentaire"
              className="text-xs font-semibold text-emerald-600 flex items-center gap-1 group-hover:gap-2 transition-all"
            >
              Voir les producteurs agroalimentaires <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION POUR FOURNISSEURS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 sm:p-12 text-center space-y-6">
          <h3 className="text-2xl sm:text-3xl font-bold text-emerald-950">
            Vous êtes grossiste ou producteur en Afrique ou en Europe ?
          </h3>
          <p className="text-slate-600 max-w-2xl mx-auto text-base">
            Rejoignez les 20 à 30 premiers fournisseurs sélectionnés de la phase pilote Lougara et accédez immédiatement à un réseau d&apos;acheteurs qualifiés.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/admin/verifications"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all"
            >
              Soumettre mon entreprise pour vérification
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

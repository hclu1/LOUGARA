'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Package,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Globe,
  ArrowLeft,
  Sparkles,
  Lock,
  X,
  Upload,
  Image as ImageIcon,
  Loader2,
  Mail,
  Eye,
  EyeOff,
  BookOpen,
  Send,
  Layers,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

const MAX_SHOWCASE_PAGES = 4;
const MAX_IMAGES_PER_PAGE = 4;

interface ProductItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  priceMin: number | null;
  priceMax: number | null;
  currency: string;
  moq: number;
  unit: string;
  originCountry: string;
  images: string[];
  externalLink?: string | null;
  isLinkApproved?: boolean;
  isPublished: boolean;
  moderationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  moderationNotes?: string | null;
  createdAt: string;
}

interface ShowcasePageDraft {
  slotIndex: number; // 0..3 (Page 1..4)
  id?: string; // id existant en base ou undefined si nouvelle page
  title: string;
  externalLink: string;
  category: string;
  originCountry: string;
  description: string;
  priceMin: string;
  priceMax: string;
  currency: string;
  moq: string;
  unit: string;
  images: string[];
  imageUrlInput: string;
  moderationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  moderationNotes?: string | null;
  isPublished?: boolean;
  isLinkApproved?: boolean;
  isDirty?: boolean;
}

interface CatalogData {
  company: {
    id: string;
    companyName: string;
    country: string;
    city: string;
    sector: string;
    verificationStatus: string;
    isPublished: boolean;
  };
  subscription: {
    name: string;
    code: string;
    maxProducts: number;
  };
  quota: {
    current: number;
    max: number;
    canAdd: boolean;
  };
  products: ProductItem[];
}

function createEmptyPageDraft(
  slotIndex: number,
  defaultCategory = 'Agroalimentaire & Épices',
  defaultOrigin = 'France'
): ShowcasePageDraft {
  return {
    slotIndex,
    id: undefined,
    title: '',
    externalLink: '',
    category: defaultCategory || 'Agroalimentaire & Épices',
    originCountry: defaultOrigin || 'France',
    description: '',
    priceMin: '',
    priceMax: '',
    currency: 'EUR',
    moq: '1',
    unit: 'pièce',
    images: [],
    imageUrlInput: '',
    moderationStatus: undefined,
    isPublished: false,
    isLinkApproved: false,
    isDirty: false,
  };
}

export default function MonCataloguePage() {
  const { user, loginWithPassword, isLoading: authLoading } = useAuth();
  const { locale } = useLanguage();

  const [catalogData, setCatalogData] = useState<CatalogData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Connexion directe sur Mon Catalogue (e-mail pré-rempli)
  const [availableCatalogs, setAvailableCatalogs] = useState<
    Array<{ id: string; companyName: string; email: string }>
  >([]);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Gestionnaire des 4 Pages Vitrines du Catalogue (Page 1 à Page 4)
  const [pageDrafts, setPageDrafts] = useState<ShowcasePageDraft[]>([
    createEmptyPageDraft(0),
    createEmptyPageDraft(1),
    createEmptyPageDraft(2),
    createEmptyPageDraft(3),
  ]);
  const [activeSlot, setActiveSlot] = useState<number>(0);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [slotImageError, setSlotImageError] = useState<string | null>(null);
  const [savingSlot, setSavingSlot] = useState<number | null>(null);
  const [isSavingAllPages, setIsSavingAllPages] = useState<boolean>(false);

  // Modale Ajout / Modification rapide (conservée en complément)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulaire Modale Produit
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Agroalimentaire & Épices');
  const [formDescription, setFormDescription] = useState('');
  const [formPriceMin, setFormPriceMin] = useState('');
  const [formPriceMax, setFormPriceMax] = useState('');
  const [formCurrency, setFormCurrency] = useState('EUR');
  const [formMoq, setFormMoq] = useState('10');
  const [formUnit, setFormUnit] = useState('pièce');
  const [formOrigin, setFormOrigin] = useState('France');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formImageInput, setFormImageInput] = useState('');
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [formExternalLink, setFormExternalLink] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const qEmail = params.get('email');
      if (qEmail) {
        setLoginEmail(qEmail.trim().toLowerCase());
      }
    }
    fetch(`/api/suppliers?_t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.suppliers && Array.isArray(data.suppliers)) {
          const list = data.suppliers
            .filter((s: any) => s.isPublished !== false)
            .map((s: any) => ({
              id: s.id,
              companyName: s.companyName,
              email: (
                s.user?.email ||
                s.email ||
                `contact@${String(s.companyName || 'entreprise').toLowerCase().replace(/[^a-z0-9]/g, '')}.fr`
              )
                .trim()
                .toLowerCase(),
            }));
          setAvailableCatalogs(list);
          setLoginEmail((prev) => prev || (list.length === 1 ? list[0].email : ''));
        }
      })
      .catch(() => {});
  }, []);

  const handleDirectCatalogLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const cleanEmail = loginEmail.trim().toLowerCase();
    if (!cleanEmail || !loginPassword) {
      setLoginError('Veuillez renseigner votre mot de passe.');
      return;
    }
    setIsLoggingIn(true);
    try {
      const res = await loginWithPassword(cleanEmail, loginPassword);
      if (!res.success) {
        setLoginError(res.error || 'Mot de passe incorrect.');
        return;
      }
      setLoginPassword('');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const syncDraftsFromCatalog = useCallback((data: CatalogData) => {
    const prods = Array.isArray(data.products) ? data.products : [];
    const defaultCat = prods[0]?.category || data.company?.sector || 'Agroalimentaire & Épices';
    const defaultOrig = prods[0]?.originCountry || data.company?.country || 'France';
    const firstLink = prods[0]?.externalLink || '';

    const nextDrafts: ShowcasePageDraft[] = [0, 1, 2, 3].map((slotIdx) => {
      const existingProd = prods[slotIdx];
      if (existingProd) {
        return {
          slotIndex: slotIdx,
          id: existingProd.id,
          title: existingProd.title || '',
          externalLink: existingProd.externalLink || '',
          category: existingProd.category || defaultCat,
          originCountry: existingProd.originCountry || defaultOrig,
          description: existingProd.description || '',
          priceMin:
            existingProd.priceMin !== null && existingProd.priceMin !== undefined
              ? String(existingProd.priceMin)
              : '',
          priceMax:
            existingProd.priceMax !== null && existingProd.priceMax !== undefined
              ? String(existingProd.priceMax)
              : '',
          currency: existingProd.currency || 'EUR',
          moq: String(existingProd.moq || 1),
          unit: existingProd.unit || 'pièce',
          images: Array.isArray(existingProd.images) ? existingProd.images : [],
          imageUrlInput: '',
          moderationStatus: existingProd.moderationStatus || (existingProd.isPublished ? 'APPROVED' : 'PENDING'),
          moderationNotes: existingProd.moderationNotes || null,
          isPublished: Boolean(existingProd.isPublished),
          isLinkApproved: Boolean(existingProd.isLinkApproved),
          isDirty: false,
        };
      }
      const empty = createEmptyPageDraft(slotIdx, defaultCat, defaultOrig);
      if (firstLink) {
        empty.externalLink = firstLink;
      }
      return empty;
    });
    setPageDrafts(nextDrafts);
  }, []);

  const fetchCatalog = useCallback(async () => {
    const targetEmail = (user?.email || loginEmail || '').trim().toLowerCase();
    if (!targetEmail) return;
    setIsLoading(true);
    setErrorNotice(null);
    try {
      const res = await fetch(
        `/api/suppliers/my-catalog?email=${encodeURIComponent(targetEmail)}&_t=${Date.now()}`,
        {
          cache: 'no-store',
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorNotice(data.error || 'Impossible de charger votre catalogue.');
        return;
      }
      setCatalogData(data);
      syncDraftsFromCatalog(data);
    } catch {
      setErrorNotice('Erreur réseau lors de la récupération de votre vitrine.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.email, loginEmail, syncDraftsFromCatalog]);

  useEffect(() => {
    if (!authLoading && user?.email) {
      fetchCatalog();
    }
  }, [authLoading, user?.email, fetchCatalog]);

  // Mise à jour d'un champ sur l'une des 4 Pages Vitrines
  const updateSlotDraft = (slotIndex: number, patch: Partial<ShowcasePageDraft>) => {
    setPageDrafts((prev) =>
      prev.map((d, idx) => (idx === slotIndex ? { ...d, ...patch, isDirty: true } : d))
    );
  };

  // Téléversement direct de photos pour la Page Vitrine active (Page 1 à 4)
  const handleUploadSlotPhotos = async (slotIndex: number, files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    const currentDraft = pageDrafts[slotIndex];
    if (!currentDraft) return;
    const remaining = MAX_IMAGES_PER_PAGE - currentDraft.images.length;
    if (remaining <= 0) {
      setSlotImageError('Maximum 4 photos par page vitrine.');
      return;
    }

    setSlotImageError(null);
    setUploadingSlot(slotIndex);
    const uploadedUrls: string[] = [];

    for (const file of Array.from(files).slice(0, remaining)) {
      if (file.size > 5 * 1024 * 1024) {
        setSlotImageError(`« ${file.name} » dépasse la taille maximale de 5 Mo.`);
        continue;
      }
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/suppliers/product-images', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.success && data.url) {
          uploadedUrls.push(data.url);
        } else {
          setSlotImageError(data?.error || `Échec du téléversement de « ${file.name} ».`);
        }
      } catch {
        setSlotImageError(`Erreur réseau lors de l’envoi de « ${file.name} ».`);
      }
    }

    if (uploadedUrls.length > 0) {
      setPageDrafts((prev) =>
        prev.map((d, idx) =>
          idx === slotIndex
            ? {
                ...d,
                images: [...d.images, ...uploadedUrls].slice(0, MAX_IMAGES_PER_PAGE),
                isDirty: true,
              }
            : d
        )
      );
    }
    setUploadingSlot(null);
  };

  const handleAddSlotImageUrl = (slotIndex: number) => {
    const current = pageDrafts[slotIndex];
    if (!current) return;
    const url = current.imageUrlInput.trim();
    if (!url) return;
    if (current.images.length >= MAX_IMAGES_PER_PAGE) {
      setSlotImageError('Maximum 4 photos par page vitrine.');
      return;
    }
    setSlotImageError(null);
    updateSlotDraft(slotIndex, {
      images: [...current.images, url],
      imageUrlInput: '',
    });
  };

  const handleRemoveSlotImage = (slotIndex: number, imgIdx: number) => {
    const current = pageDrafts[slotIndex];
    if (!current) return;
    updateSlotDraft(slotIndex, {
      images: current.images.filter((_, i) => i !== imgIdx),
    });
  };

  // Valider une Page Vitrine individuelle (Page 1, 2, 3 ou 4) et l'envoyer à Admin Lougara
  const handleValidateSinglePage = async (slotIndex: number) => {
    if (!user?.email) return;
    const draft = pageDrafts[slotIndex];
    if (!draft) return;

    if (!draft.title.trim() || !draft.description.trim()) {
      setErrorNotice(
        `Veuillez renseigner au moins le titre et la description de la Page Vitrine ${slotIndex + 1} avant de la valider.`
      );
      return;
    }

    setSavingSlot(slotIndex);
    setErrorNotice(null);
    setSuccessNotice(null);

    const isUpdate = Boolean(draft.id);
    const payload = {
      email: user.email,
      id: draft.id,
      title: draft.title.trim(),
      description: draft.description.trim(),
      category: draft.category,
      priceMin: draft.priceMin || null,
      priceMax: draft.priceMax || null,
      currency: draft.currency,
      moq: draft.moq ? parseInt(draft.moq, 10) : 1,
      unit: draft.unit,
      originCountry: draft.originCountry,
      images: draft.images,
      externalLink: draft.externalLink.trim() || null,
    };

    try {
      const res = await fetch('/api/suppliers/my-catalog', {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorNotice(data.error || `Erreur lors de la validation de la Page Vitrine ${slotIndex + 1}.`);
        return;
      }
      setSuccessNotice(
        `Page Vitrine ${slotIndex + 1}/4 (« ${draft.title.trim()} ») validée par vous ! Elle est maintenant transmise à l'Admin Lougara pour validation finale.`
      );
      await fetchCatalog();
    } catch {
      setErrorNotice('Erreur réseau lors de la validation de votre page vitrine.');
    } finally {
      setSavingSlot(null);
    }
  };

  // Valider toutes les Pages Vitrines renseignées (1 à 4) d'un seul clic et les envoyer à Admin Lougara
  const handleValidateAllPages = async () => {
    if (!user?.email) return;
    const filledPages = pageDrafts.filter(
      (d) => d.title.trim().length > 0 && d.description.trim().length > 0
    );

    if (filledPages.length === 0) {
      setErrorNotice(
        'Veuillez compléter au moins une page vitrine (titre et description) avant de valider.'
      );
      return;
    }

    setIsSavingAllPages(true);
    setErrorNotice(null);
    setSuccessNotice(null);

    try {
      const res = await fetch('/api/suppliers/my-catalog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          pages: filledPages.map((d) => ({
            id: d.id,
            title: d.title.trim(),
            description: d.description.trim(),
            category: d.category,
            priceMin: d.priceMin || null,
            priceMax: d.priceMax || null,
            currency: d.currency,
            moq: d.moq ? parseInt(d.moq, 10) : 1,
            unit: d.unit,
            originCountry: d.originCountry,
            images: d.images,
            externalLink: d.externalLink.trim() || null,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorNotice(data.error || 'Erreur lors de la validation groupée de vos pages vitrines.');
        return;
      }
      setSuccessNotice(
        data.message ||
          `Vos ${filledPages.length} page(s) vitrine(s) ont été validées et transmises à l'Admin Lougara pour validation finale !`
      );
      await fetchCatalog();
    } catch {
      setErrorNotice('Erreur réseau lors de la validation de vos pages.');
    } finally {
      setIsSavingAllPages(false);
    }
  };

  // Passer directement à la prochaine page vitrine disponible (ex: Page 2, Page 3, Page 4)
  const handleGoToNextFreePageSlot = () => {
    const nextEmptyIdx = pageDrafts.findIndex((d) => !d.id && !d.title.trim());
    if (nextEmptyIdx !== -1) {
      setActiveSlot(nextEmptyIdx);
    } else if (activeSlot < MAX_SHOWCASE_PAGES - 1) {
      setActiveSlot(activeSlot + 1);
    }
    const editorEl = document.getElementById('showcase-4pages-builder');
    if (editorEl) {
      editorEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormTitle('');
    setFormCategory(catalogData?.company?.sector || 'Agroalimentaire & Épices');
    setFormDescription('');
    setFormPriceMin('');
    setFormPriceMax('');
    setFormCurrency('EUR');
    setFormMoq('10');
    setFormUnit('pièce');
    setFormOrigin(catalogData?.company.country || 'France');
    setFormImages([]);
    setFormImageInput('');
    setImageUploadError(null);
    setFormExternalLink(catalogData?.products?.[0]?.externalLink || '');
    setIsModalOpen(true);
    setErrorNotice(null);
  };

  const handleOpenEditModal = (p: ProductItem, slotIndex?: number) => {
    if (typeof slotIndex === 'number' && slotIndex >= 0 && slotIndex < MAX_SHOWCASE_PAGES) {
      setActiveSlot(slotIndex);
      const editorEl = document.getElementById('showcase-4pages-builder');
      if (editorEl) {
        editorEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    setEditingProduct(p);
    setFormTitle(p.title);
    setFormCategory(p.category || 'Agroalimentaire & Épices');
    setFormDescription(p.description || '');
    setFormPriceMin(p.priceMin ? String(p.priceMin) : '');
    setFormPriceMax(p.priceMax ? String(p.priceMax) : '');
    setFormCurrency(p.currency || 'EUR');
    setFormMoq(String(p.moq || 1));
    setFormUnit(p.unit || 'pièce');
    setFormOrigin(p.originCountry || 'France');
    setFormImages(p.images || []);
    setFormImageInput('');
    setImageUploadError(null);
    setFormExternalLink(p.externalLink || '');
    setIsModalOpen(true);
    setErrorNotice(null);
  };

  const handleUploadDirectPhotos = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    const remainingSlots = 4 - formImages.length;
    if (remainingSlots <= 0) {
      setImageUploadError('Maximum 4 photos par produit.');
      return;
    }

    setImageUploadError(null);
    setIsUploadingImages(true);
    const uploadedUrls: string[] = [];

    for (const file of Array.from(files).slice(0, remainingSlots)) {
      if (file.size > 5 * 1024 * 1024) {
        setImageUploadError(`« ${file.name} » dépasse la taille maximale de 5 Mo.`);
        continue;
      }
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/suppliers/product-images', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.success && data.url) {
          uploadedUrls.push(data.url);
        } else {
          setImageUploadError(data?.error || `Échec du téléversement de « ${file.name} ».`);
        }
      } catch {
        setImageUploadError(`Erreur réseau lors de l’envoi de « ${file.name} ».`);
      }
    }

    if (uploadedUrls.length > 0) {
      setFormImages((prev) => [...prev, ...uploadedUrls].slice(0, 4));
    }
    setIsUploadingImages(false);
  };

  const handleAddImage = () => {
    const url = formImageInput.trim();
    if (!url) return;
    if (formImages.length >= 4) {
      setImageUploadError('Maximum 4 photos par produit.');
      return;
    }
    setImageUploadError(null);
    setFormImages([...formImages, url]);
    setFormImageInput('');
  };

  const handleRemoveImage = (index: number) => {
    setFormImages(formImages.filter((_, i) => i !== index));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    if (!formTitle.trim() || !formDescription.trim()) {
      alert('Veuillez renseigner au moins le titre et la description du produit.');
      return;
    }

    setIsSubmitting(true);
    setErrorNotice(null);
    setSuccessNotice(null);

    const payload = {
      email: user.email,
      id: editingProduct ? editingProduct.id : undefined,
      title: formTitle.trim(),
      description: formDescription.trim(),
      category: formCategory,
      priceMin: formPriceMin || null,
      priceMax: formPriceMax || null,
      currency: formCurrency,
      moq: formMoq ? parseInt(formMoq, 10) : 1,
      unit: formUnit,
      originCountry: formOrigin,
      images: formImages,
      externalLink: formExternalLink.trim() || null,
    };

    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const res = await fetch('/api/suppliers/my-catalog', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorNotice(data.error || 'Erreur lors de l’enregistrement du produit.');
        return;
      }

      setSuccessNotice(
        data.message ||
          'Page vitrine enregistrée et transmise à l’Admin Lougara pour validation finale.'
      );
      setIsModalOpen(false);
      await fetchCatalog();
    } catch {
      setErrorNotice('Erreur réseau lors de la sauvegarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Êtes-vous certain de vouloir supprimer cette page / référence de votre vitrine ?')) {
      return;
    }

    if (!user?.email) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/suppliers/my-catalog?id=${encodeURIComponent(productId)}&email=${encodeURIComponent(user.email)}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Erreur lors de la suppression.');
        return;
      }
      setSuccessNotice('Page vitrine supprimée de votre catalogue.');
      await fetchCatalog();
    } catch {
      alert('Erreur réseau lors de la suppression.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0B132B] text-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 font-bold">Chargement de votre session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B132B] text-slate-100 flex items-center justify-center p-4">
        <div className="glass-card gold-glow-border p-8 rounded-3xl max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-white">Connexion à Mon Catalogue</h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Sélectionnez votre catalogue : votre adresse e-mail s&apos;affiche automatiquement et il vous suffit de renseigner le mot de passe créé lors de votre contact 4/5.
            </p>
          </div>

          {loginError && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-rose-950/90 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleDirectCatalogLogin} className="space-y-4">
            {availableCatalogs.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">
                  Sélectionner mon catalogue
                </label>
                <select
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4AF37]/40 bg-slate-900 text-xs font-bold text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                >
                  <option value="">— Choisir mon catalogue —</option>
                  {availableCatalogs.map((c) => (
                    <option key={c.id} value={c.email}>
                      {c.companyName} ({c.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Votre adresse e-mail *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="contact@entreprise.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-sm font-bold text-amber-300 focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Votre mot de passe *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showLoginPwd ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Renseignez votre mot de passe"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPwd((prev) => !prev)}
                  aria-label={showLoginPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  aria-pressed={showLoginPwd}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showLoginPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 px-4 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] hover:opacity-95 transition-all text-center block shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {isLoggingIn ? 'Connexion en cours...' : 'Se connecter à mon catalogue'}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800 text-center">
            <Link
              href={loginEmail ? `/connexion?mode=register_password&email=${encodeURIComponent(loginEmail)}` : '/connexion'}
              className="text-xs font-bold text-amber-400 hover:underline"
            >
              Créer ou réinitialiser mon mot de passe &rarr;
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const quota = catalogData?.quota;
  const isLimitReached = (catalogData?.products?.length ?? 0) >= MAX_SHOWCASE_PAGES;
  const activeDraft = pageDrafts[activeSlot] || pageDrafts[0];
  const filledDraftsCount = pageDrafts.filter(
    (d) => d.title.trim().length > 0 && d.description.trim().length > 0
  ).length;
  const approvedPagesCount = (catalogData?.products || []).filter(
    (p) => p.moderationStatus === 'APPROVED' && p.isPublished
  ).length;
  const pendingPagesCount = (catalogData?.products || []).filter(
    (p) => p.moderationStatus === 'PENDING' || !p.isPublished
  ).length;

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* BANDEAU SUPÉRIEUR & NAVIGATION */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/catalogue"
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-amber-400/50 transition-all"
              title="Retour au catalogue"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-white">
                  Gérer mon Catalogue &amp; mes 4 Pages Vitrines
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  4 Pages Vitrines Autorisées
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {catalogData?.company?.companyName || user.companyName || user.email} &bull; Modifiez vos pages existantes ou ajoutez jusqu&apos;à 4 pages vitrines puis validez-les pour validation finale par Admin Lougara.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/catalogue"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-200 bg-slate-900 border border-slate-700 hover:border-amber-400/60 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Voir au Catalogue Public</span>
            </Link>

            <button
              type="button"
              onClick={handleGoToNextFreePageSlot}
              disabled={isLimitReached}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black shadow-lg transition-all cursor-pointer ${
                isLimitReached
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-slate-900 text-amber-300 border border-[#D4AF37]/50 hover:border-[#D4AF37]'
              }`}
            >
              <Plus className="w-4 h-4 text-[#D4AF37]" />
              <span>+ Ajouter une Page Vitrine ({catalogData?.products.length ?? 0}/4)</span>
            </button>

            <button
              type="button"
              onClick={handleValidateAllPages}
              disabled={isSavingAllPages || filledDraftsCount === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black shadow-lg bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-slate-950 hover:opacity-95 disabled:opacity-50 cursor-pointer"
            >
              {isSavingAllPages ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Valider mes pages ({filledDraftsCount}/4) &rarr; Admin Lougara</span>
            </button>
          </div>
        </div>

        {/* NOTICES ALERTE / SUCCÈS */}
        {errorNotice && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <span>{errorNotice}</span>
          </div>
        )}

        {successNotice && (
          <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* CARTES RÉCAPITULATIVES : QUOTA 4 PAGES & CIRCUIT DE VALIDATION FINALE ADMIN LOUGARA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Pages Vitrines de votre Catalogue</span>
              <Layers className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#E5A93C]">
                {catalogData?.products.length ?? 0}
              </span>
              <span className="text-xs text-slate-400 font-bold">
                / {MAX_SHOWCASE_PAGES} pages vitrines autorisées
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 bg-emerald-500"
                style={{
                  width: `${Math.min(100, (((catalogData?.products.length ?? 0) / MAX_SHOWCASE_PAGES) * 100))}%`,
                }}
              />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Statut de vos Pages Vitrines</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                ✓ {approvedPagesCount} validée{approvedPagesCount > 1 ? 's' : ''} en ligne
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-950 text-amber-300 border border-amber-500/40">
                ⏳ {pendingPagesCount} en attente Admin Lougara
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Chaque page validée par vous est transmise à l&apos;Admin Lougara pour validation finale.
            </p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Circuit de Validation en 2 étapes</span>
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div className="text-xs font-extrabold text-white">
              1. Vous validez vos pages &rarr; 2. Admin Lougara publie
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Modifiez votre 1ère page ou ajoutez les pages 2, 3 et 4 sur le même principe, validez-les, puis l&apos;Admin Lougara effectue la validation finale.
            </p>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* GESTIONNAIRE INTERACTIF DES 4 PAGES VITRINES (SUR LE MÊME PRINCIPE)  */}
        {/* ===================================================================== */}
        <div
          id="showcase-4pages-builder"
          className="glass-card gold-glow-border p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/40 space-y-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#D4AF37]">
                Éditeur de Catalogue &bull; 4 Pages Vitrines
              </span>
              <h2 className="text-xl font-black text-white flex items-center gap-2 mt-0.5">
                <BookOpen className="w-5 h-5 text-[#E5A93C]" />
                <span>Composer, modifier et valider mes 4 Pages Vitrines</span>
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Sélectionnez ci-dessous la <strong>Page 1</strong> (votre première page vitrine existante) ou cliquez sur les <strong>Pages 2, 3 et 4</strong> pour en ajouter de nouvelles exactement sur le même principe, puis cliquez sur <strong>« Valider »</strong>.
              </p>
            </div>

            {/* SÉLECTEUR DES 4 PAGES VITRINES */}
            <div className="flex flex-wrap items-center gap-2">
              {[0, 1, 2, 3].map((slotIdx) => {
                const slot = pageDrafts[slotIdx];
                const existsInDb = Boolean(slot?.id);
                const hasText = Boolean(slot?.title?.trim());
                const isApproved = slot?.moderationStatus === 'APPROVED' && slot?.isPublished;
                const isSelected = activeSlot === slotIdx;

                return (
                  <button
                    key={slotIdx}
                    type="button"
                    onClick={() => {
                      setActiveSlot(slotIdx);
                      setSlotImageError(null);
                    }}
                    className={`px-3.5 py-2.5 rounded-2xl text-xs font-black border transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-slate-950 border-[#D4AF37] shadow-lg scale-[1.02]'
                        : existsInDb
                          ? isApproved
                            ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 hover:border-emerald-400'
                            : 'bg-amber-950/70 text-amber-300 border-amber-500/40 hover:border-amber-400'
                          : hasText
                            ? 'bg-slate-800 text-amber-300 border-amber-500/40'
                            : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full text-[11px] font-black flex items-center justify-center ${
                        isSelected ? 'bg-slate-950 text-[#D4AF37]' : 'bg-slate-800 text-slate-200'
                      }`}
                    >
                      {slotIdx + 1}
                    </span>
                    <div className="text-left">
                      <div className="leading-none">Page Vitrine {slotIdx + 1}</div>
                      <div
                        className={`text-[9px] font-bold mt-0.5 ${
                          isSelected
                            ? 'text-slate-900'
                            : existsInDb
                              ? isApproved
                                ? 'text-emerald-400'
                                : 'text-amber-400'
                              : 'text-slate-400'
                        }`}
                      >
                        {existsInDb
                          ? isApproved
                            ? '✓ Validée Admin'
                            : '⏳ En attente Admin'
                          : hasText
                            ? 'Brouillon à valider'
                            : '+ À compléter'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CORPS DE LA PAGE VITRINE SÉLECTIONNÉE : FORMULAIRE CÔTE À CÔTE AVEC APERÇU VITRINE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* COLONNE GAUCHE (7 cols) : FORMULAIRE IDENTIQUE À LA 1ÈRE PAGE VITRINE */}
            <div className="lg:col-span-7 space-y-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-[#D4AF37]/20 text-[#E5A93C] border border-[#D4AF37]/40">
                    Page Vitrine {activeSlot + 1} sur 4
                  </span>
                  {activeDraft.id ? (
                    activeDraft.moderationStatus === 'APPROVED' && activeDraft.isPublished ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Validée &amp; Publiée par Admin Lougara
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-950 text-amber-300 border border-amber-500/40">
                        <Clock className="w-3.5 h-3.5" /> En attente de validation finale Admin Lougara
                      </span>
                    )
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900 text-slate-300 border border-slate-700">
                      <Plus className="w-3 h-3 text-[#D4AF37]" /> Nouvelle page vitrine à compléter et valider
                    </span>
                  )}
                </div>

                {activeDraft.id && (
                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(activeDraft.id!)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 hover:text-rose-300 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Supprimer cette page
                  </button>
                )}
              </div>

              {/* 1. TITRE DE LA PAGE VITRINE / PRODUIT */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Titre de la Page Vitrine {activeSlot + 1} / Nom du produit ou de l&apos;offre *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Application de gestion sur-mesure / Beurre de karité bio..."
                  value={activeDraft.title}
                  onChange={(e) => updateSlotDraft(activeSlot, { title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              {/* 2. LIEN EXTERNE SOUS LE TITRE (COMME SUR LA 1ÈRE PAGE VITRINE) */}
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
                    Lien externe de la Page Vitrine {activeSlot + 1} (Optionnel)
                  </label>
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-950/70 px-2 py-0.5 rounded-full border border-amber-500/30">
                    {activeDraft.isLinkApproved ? '✓ Lien validé Admin' : 'Validation finale par Admin Lougara'}
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="https://votre-site.com/page-ou-application"
                  value={activeDraft.externalLink}
                  onChange={(e) => updateSlotDraft(activeSlot, { externalLink: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white font-mono focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              {/* 3. CATÉGORIE ET PAYS D'ORIGINE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Catégorie / Secteur *
                  </label>
                  <select
                    value={activeDraft.category}
                    onChange={(e) => updateSlotDraft(activeSlot, { category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  >
                    <option value="Agroalimentaire & Épices">Agroalimentaire &amp; Épices</option>
                    <option value="Cosmétique & Soins">Cosmétique &amp; Soins</option>
                    <option value="Textile & Confection">Textile &amp; Confection</option>
                    <option value="Artisanat & Décoration">Artisanat &amp; Décoration</option>
                    <option value="Matériaux & BTP">Matériaux &amp; BTP</option>
                    <option value="Électronique & Énergie">Électronique &amp; Énergie</option>
                    <option value="Négoce & Commerce Général">Négoce &amp; Commerce Général</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Pays d&apos;origine
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: France, Sénégal, Côte d'Ivoire..."
                    value={activeDraft.originCountry}
                    onChange={(e) => updateSlotDraft(activeSlot, { originCountry: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              {/* 4. DESCRIPTION DÉTAILLÉE DE LA PAGE VITRINE */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Description détaillée de la Page Vitrine {activeSlot + 1} *
                </label>
                <textarea
                  rows={4}
                  placeholder="Présentez en détail cette page vitrine : caractéristiques, atouts, conditions commerciales, spécifications..."
                  value={activeDraft.description}
                  onChange={(e) => updateSlotDraft(activeSlot, { description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              {/* 5. PRIX ET MOQ */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Prix Min</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={activeDraft.priceMin}
                    onChange={(e) => updateSlotDraft(activeSlot, { priceMin: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Prix Max</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={activeDraft.priceMax}
                    onChange={(e) => updateSlotDraft(activeSlot, { priceMax: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Devise</label>
                  <select
                    value={activeDraft.currency}
                    onChange={(e) => updateSlotDraft(activeSlot, { currency: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="XOF">XOF (FCFA)</option>
                    <option value="MAD">MAD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Qté min.</label>
                  <input
                    type="number"
                    min="1"
                    value={activeDraft.moq}
                    onChange={(e) => updateSlotDraft(activeSlot, { moq: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Unité</label>
                  <input
                    type="text"
                    placeholder="pièce, licence..."
                    value={activeDraft.unit}
                    onChange={(e) => updateSlotDraft(activeSlot, { unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white"
                  />
                </div>
              </div>

              {/* 6. PHOTOS DIRECTES DE LA PAGE VITRINE (JUSQU'À 4 PHOTOS) */}
              <div className="space-y-2.5 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#D4AF37]" />
                    Photos de la Page Vitrine {activeSlot + 1} ({activeDraft.images.length}/{MAX_IMAGES_PER_PAGE})
                  </label>
                  <span className="text-[10px] font-bold text-slate-400">
                    JPG, PNG, WEBP &bull; 5 Mo max
                  </span>
                </div>

                {slotImageError && (
                  <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-[11px] font-bold flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>{slotImageError}</span>
                  </div>
                )}

                {activeDraft.images.length < MAX_IMAGES_PER_PAGE && (
                  <label
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (uploadingSlot === null && e.dataTransfer?.files?.length) {
                        handleUploadSlotPhotos(activeSlot, e.dataTransfer.files);
                      }
                    }}
                    className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-[#D4AF37]/50 hover:border-[#D4AF37] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/15 text-[#E5A93C] transition-all flex items-center justify-center gap-2 text-xs font-black cursor-pointer"
                  >
                    {uploadingSlot === activeSlot ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                        <span>Téléversement des photos en cours...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-[#D4AF37]" />
                        <span>Ajouter directement des photos depuis mon appareil (ou glisser-déposer)</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      disabled={uploadingSlot !== null}
                      className="hidden"
                      onChange={(e) => {
                        handleUploadSlotPhotos(activeSlot, e.target.files);
                        e.target.value = '';
                      }}
                    />
                  </label>
                )}

                {activeDraft.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2.5 pt-1">
                    {activeDraft.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative h-20 rounded-xl overflow-hidden border border-slate-700 bg-slate-950"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveSlotImage(activeSlot, idx)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-slate-950/90 text-rose-400 hover:bg-rose-950 cursor-pointer"
                          aria-label="Supprimer la photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-1 border-t border-slate-800/80 flex gap-2">
                  <input
                    type="url"
                    placeholder="Ou coller un lien d'image (https://...)"
                    value={activeDraft.imageUrlInput}
                    onChange={(e) => updateSlotDraft(activeSlot, { imageUrlInput: e.target.value })}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSlotImageUrl(activeSlot)}
                    disabled={
                      activeDraft.images.length >= MAX_IMAGES_PER_PAGE ||
                      !activeDraft.imageUrlInput.trim()
                    }
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50 cursor-pointer"
                  >
                    Ajouter le lien
                  </button>
                </div>
              </div>

              {/* BOUTONS D'ACTION : VALIDER CETTE PAGE OU TOUTES LES PAGES */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleValidateSinglePage(activeSlot)}
                  disabled={savingSlot === activeSlot || isSavingAllPages}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] hover:opacity-95 shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {savingSlot === activeSlot ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>
                    {activeDraft.id
                      ? `Valider mes modifications sur la Page Vitrine ${activeSlot + 1} (Envoi Admin Lougara)`
                      : `Valider et ajouter la Page Vitrine ${activeSlot + 1} (Envoi Admin Lougara)`}
                  </span>
                </button>

                {activeSlot < MAX_SHOWCASE_PAGES - 1 && (
                  <button
                    type="button"
                    onClick={() => setActiveSlot(activeSlot + 1)}
                    className="py-3 px-4 rounded-xl text-xs font-bold text-amber-300 bg-slate-900 border border-[#D4AF37]/40 hover:border-[#D4AF37] transition-all cursor-pointer"
                  >
                    Passer à la Page {activeSlot + 2}/4 &rarr;
                  </button>
                )}
              </div>
            </div>

            {/* COLONNE DROITE (5 cols) : APERÇU EN DIRECT DE LA PAGE VITRINE (MÊME PRINCIPE QUE LA 1ÈRE PAGE) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Aperçu Vitrine — Page {activeSlot + 1} / 4
                </span>
                <span className="text-[11px] text-slate-400">
                  Rendu identique à votre 1ère page vitrine
                </span>
              </div>

              <div className="glass-card rounded-3xl overflow-hidden border border-[#D4AF37]/40 shadow-xl flex flex-col justify-between">
                <div className="relative h-56 bg-slate-950 overflow-hidden">
                  {activeDraft.images.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={activeDraft.images[0]}
                      alt={activeDraft.title || `Page Vitrine ${activeSlot + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                      <ImageIcon className="w-10 h-10" />
                      <span className="text-xs font-bold">Aperçu photo Page Vitrine {activeSlot + 1}</span>
                    </div>
                  )}

                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                    <span className="px-3 py-1 rounded-full text-[11px] font-black bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-slate-950 shadow">
                      Page Vitrine {activeSlot + 1} / 4
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/85 text-amber-300 border border-amber-500/30">
                      {activeDraft.category}
                    </span>
                  </div>

                  {activeDraft.images.length > 1 && (
                    <div className="absolute bottom-2 left-3 flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                      {activeDraft.images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="w-7 h-7 rounded-lg overflow-hidden border border-[#D4AF37]"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-3 bg-slate-900/70">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-400">
                      {catalogData?.company?.companyName || user.companyName || 'Mon Catalogue'}
                    </span>
                    <span className="text-slate-400">{activeDraft.originCountry}</span>
                  </div>

                  <h3 className="text-base font-black text-white">
                    {activeDraft.title.trim() || `Titre de votre Page Vitrine ${activeSlot + 1}`}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line line-clamp-4">
                    {activeDraft.description.trim() ||
                      'La description détaillée de votre page vitrine apparaîtra ici telle qu’elle sera présentée aux acheteurs après validation finale par Admin Lougara.'}
                  </p>

                  {activeDraft.externalLink.trim() && (
                    <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] flex items-center justify-between gap-2">
                      <span className="text-amber-300 font-mono truncate flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                        {activeDraft.externalLink}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 shrink-0">
                        {activeDraft.isLinkApproved ? 'Validé ✓' : 'Contrôle Admin'}
                      </span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-black text-[#E5A93C]">
                      {activeDraft.priceMin
                        ? `${activeDraft.priceMin}${activeDraft.priceMax ? ` - ${activeDraft.priceMax}` : ''} ${activeDraft.currency}`
                        : 'Prix sur demande'}
                    </span>
                    <span className="text-emerald-400 font-bold">
                      MOQ : {activeDraft.moq || 1} {activeDraft.unit || 'pièce'}s
                    </span>
                  </div>
                </div>
              </div>

              {/* BOUTON GLOBAL DE VALIDATION DES 4 PAGES */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-[#D4AF37]/30 space-y-2.5">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Validation globale de votre catalogue ({filledDraftsCount}/4 pages renseignées)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Vous pouvez valider uniquement la page en cours ou cliquer ci-dessous pour valider d&apos;un coup toutes vos pages renseignées. L&apos;Admin Lougara effectuera ensuite la validation finale pour les publier.
                </p>
                <button
                  type="button"
                  onClick={handleValidateAllPages}
                  disabled={isSavingAllPages || filledDraftsCount === 0}
                  className="w-full py-3 px-4 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] via-[#E5A93C] to-[#B8860B] hover:opacity-95 shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSavingAllPages ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>
                    Valider mes {filledDraftsCount} page(s) vitrine(s) pour validation finale Admin Lougara
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* LISTE RÉCAPITULATIVE DES PAGES DU CATALOGUE */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-400" />
              <span>
                Vue d&apos;ensemble de vos Pages Vitrines ({catalogData?.products.length ?? 0}/{MAX_SHOWCASE_PAGES})
              </span>
            </h2>
          </div>

          {isLoading ? (
            <div className="glass-card p-12 rounded-3xl text-center space-y-3">
              <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-400">Chargement de vos pages vitrines...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[0, 1, 2, 3].map((slotIdx) => {
                const p = catalogData?.products?.[slotIdx];
                if (!p) {
                  return (
                    <div
                      key={`empty-slot-${slotIdx}`}
                      onClick={() => {
                        setActiveSlot(slotIdx);
                        const el = document.getElementById('showcase-4pages-builder');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="glass-card rounded-2xl border-2 border-dashed border-slate-800 hover:border-[#D4AF37]/60 p-6 flex flex-col items-center justify-center text-center gap-3 cursor-pointer transition-all min-h-[280px] group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 group-hover:border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
                        <Plus className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-black uppercase text-amber-300">
                          Page Vitrine {slotIdx + 1} / 4
                        </span>
                        <h3 className="text-sm font-bold text-white">Emplacement disponible</h3>
                        <p className="text-[11px] text-slate-400">
                          Cliquez ici pour créer et faire valider votre {slotIdx + 1}e page vitrine par Admin Lougara.
                        </p>
                      </div>
                    </div>
                  );
                }

                const hasImages = Array.isArray(p.images) && p.images.length > 0;
                const isApprovedByAdmin = p.moderationStatus === 'APPROVED' && p.isPublished;
                const isRejectedByAdmin = p.moderationStatus === 'REJECTED';

                return (
                  <div
                    key={p.id}
                    className={`glass-card rounded-2xl border p-5 flex flex-col justify-between space-y-4 transition-all ${
                      activeSlot === slotIdx
                        ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/40'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#D4AF37]/20 text-[#E5A93C] border border-[#D4AF37]/40">
                          Page Vitrine {slotIdx + 1}/4
                        </span>
                        {isApprovedByAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Validée Admin
                          </span>
                        ) : isRejectedByAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-950 text-rose-300 border border-rose-500/40">
                            Refusée Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-950 text-amber-300 border border-amber-500/40">
                            <Clock className="w-2.5 h-2.5" /> En attente Admin
                          </span>
                        )}
                      </div>

                      {/* APERÇU PHOTO DU PRODUIT */}
                      <div className="h-36 rounded-xl bg-slate-950 overflow-hidden relative border border-slate-900">
                        {hasImages ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <ImageIcon className="w-8 h-8" />
                          </div>
                        )}
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/80 backdrop-blur-sm text-slate-300 border border-slate-800">
                          {p.category}
                        </span>
                        {hasImages && p.images.length > 1 && (
                          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/80 text-amber-300 border border-amber-500/30">
                            {p.images.length} photos
                          </span>
                        )}
                      </div>

                      {/* INFORMATIONS PRINCIPALES */}
                      <div>
                        <h3 className="text-sm font-extrabold text-white line-clamp-1">{p.title}</h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {p.description}
                        </p>
                      </div>

                      {/* PRIX ET MOQ */}
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                        <span className="font-extrabold text-[#E5A93C]">
                          {p.priceMin
                            ? `${p.priceMin} ${p.priceMax ? `- ${p.priceMax}` : ''} ${p.currency}`
                            : 'Prix sur demande'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          MOQ : {p.moq} {p.unit}s
                        </span>
                      </div>
                    </div>

                    {/* ACTIONS SUR LA PAGE VITRINE */}
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(p, slotIdx)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] hover:opacity-95 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Modifier Page {slotIdx + 1}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(p.id)}
                        className="inline-flex items-center justify-center p-1.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/30 transition-colors cursor-pointer"
                        title="Supprimer cette page"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MODALE D'AJOUT / ÉDITION DE PRODUIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="glass-card gold-glow-border rounded-3xl max-w-xl w-full p-6 sm:p-7 border border-[#D4AF37]/50 shadow-2xl relative my-8 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 mb-6">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-[#D4AF37]" />
                {editingProduct ? 'Modifier la Page Vitrine' : 'Ajouter une nouvelle Page Vitrine'}
              </h3>
              <p className="text-xs text-slate-400">
                Renseignez et validez cette page vitrine : elle sera ensuite soumise à la validation finale de l&apos;Admin Lougara.
              </p>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Titre du produit / de la page vitrine *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Huile d'Argan Bio Pure 100ml"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Catégorie *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  >
                    <option value="Agroalimentaire & Épices">Agroalimentaire &amp; Épices</option>
                    <option value="Cosmétique & Soins">Cosmétique &amp; Soins</option>
                    <option value="Textile & Confection">Textile &amp; Confection</option>
                    <option value="Artisanat & Décoration">Artisanat &amp; Décoration</option>
                    <option value="Matériaux & BTP">Matériaux &amp; BTP</option>
                    <option value="Électronique & Énergie">Électronique &amp; Énergie</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Pays d&apos;origine
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Sénégal, France, Maroc..."
                    value={formOrigin}
                    onChange={(e) => setFormOrigin(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Description détaillée du produit *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Caractéristiques, certifications, conditionnement, usages recommandés..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              {/* TARIFS ET MOQ */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Prix Min</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formPriceMin}
                    onChange={(e) => setFormPriceMin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Prix Max</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formPriceMax}
                    onChange={(e) => setFormPriceMax(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Devise</label>
                  <select
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="XOF">XOF (FCFA)</option>
                    <option value="MAD">MAD (Dirham)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Quantité minimum (MOQ)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formMoq}
                    onChange={(e) => setFormMoq(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Unité</label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                  >
                    <option value="pièce">pièce</option>
                    <option value="carton">carton</option>
                    <option value="palette">palette</option>
                    <option value="kg">kg</option>
                    <option value="litre">litre</option>
                  </select>
                </div>
              </div>

              {/* CHAMP : LIEN EXTERNE AVEC MODÉRATION ADMIN */}
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-amber-300 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    Lien externe du produit (Optionnel)
                  </label>
                  <span className="text-[10px] text-slate-400 font-bold">
                    Vérification par coche admin
                  </span>
                </div>
                <input
                  type="url"
                  placeholder="https://votre-site.com/produit-ou-catalogue"
                  value={formExternalLink}
                  onChange={(e) => setFormExternalLink(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Ce lien (boutique, site officiel ou plaquette PDF) sera soumis à nos administrateurs. Il apparaîtra sur votre fiche produit dès qu&apos;il aura été validé.
                </p>
              </div>

              {/* GESTION DES PHOTOS DU PRODUIT (UPLOAD DIRECT + LIEN OPTIONNEL) */}
              <div className="space-y-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#D4AF37]" />
                    Photos du produit ({formImages.length}/4)
                  </label>
                  <span className="text-[10px] font-bold text-slate-400">
                    JPG, PNG, WEBP &bull; 5 Mo max
                  </span>
                </div>

                {imageUploadError && (
                  <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-[11px] font-bold flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>{imageUploadError}</span>
                  </div>
                )}

                {formImages.length < 4 && (
                  <label
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!isUploadingImages && e.dataTransfer?.files?.length) {
                        handleUploadDirectPhotos(e.dataTransfer.files);
                      }
                    }}
                    className={`w-full py-3.5 px-4 rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-2.5 text-xs font-black cursor-pointer ${
                      isUploadingImages
                        ? 'border-[#D4AF37]/60 bg-slate-950/70 text-amber-300 cursor-wait'
                        : 'border-[#D4AF37]/50 hover:border-[#D4AF37] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/15 text-[#E5A93C]'
                    }`}
                  >
                    {isUploadingImages ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                        <span>Téléversement des photos en cours...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-[#D4AF37]" />
                        <span>Ajouter directement des photos depuis mon appareil (ou glisser-déposer)</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      disabled={isUploadingImages || formImages.length >= 4}
                      className="hidden"
                      onChange={(e) => {
                        handleUploadDirectPhotos(e.target.files);
                        e.target.value = '';
                      }}
                    />
                  </label>
                )}

                {formImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2.5 pt-1">
                    {formImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative h-20 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          aria-label={`Supprimer la photo ${idx + 1}`}
                          className="absolute top-1 right-1 p-1 rounded-full bg-slate-950/90 text-rose-400 hover:bg-rose-950 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {formImages.length < 4 && (
                      <label className="h-20 rounded-xl border border-dashed border-slate-700 hover:border-[#D4AF37] bg-slate-950/60 flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-slate-400 hover:text-amber-300 cursor-pointer transition-colors">
                        {isUploadingImages ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                        ) : (
                          <>
                            <Plus className="w-4 h-4 text-[#D4AF37]" />
                            <span>+ Photo</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          multiple
                          disabled={isUploadingImages}
                          className="hidden"
                          onChange={(e) => {
                            handleUploadDirectPhotos(e.target.files);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    )}
                  </div>
                )}

                <div className="pt-1 border-t border-slate-800/80 space-y-1.5">
                  <span className="block text-[10px] font-bold text-slate-400">
                    Ou joindre un lien d&apos;image (optionnel) :
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="URL de l'image (https://...)"
                      value={formImageInput}
                      onChange={(e) => setFormImageInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddImage}
                      disabled={formImages.length >= 4 || !formImageInput.trim()}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50 cursor-pointer"
                    >
                      Ajouter le lien
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] hover:opacity-95 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting
                    ? 'Validation...'
                    : editingProduct
                      ? 'Valider les modifications (Envoi Admin Lougara)'
                      : 'Valider et soumettre à Admin Lougara'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

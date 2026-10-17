'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  FolderOpen,
  X,
  Scan,
  Loader2,
  FileCheck,
  Sparkles,
  Link2,
} from 'lucide-react';

export interface DocumentDropzoneProps {
  id?: string;
  label?: string;
  title?: string;
  subtitle?: string;
  accept?: string;
  currentFile?: string | null;
  fileSize?: string | null;
  filePath?: string | null;
  isScanning?: boolean;
  scanStep?: string;
  confidenceScore?: number | null;
  onFileSelected: (file: File) => void | Promise<void>;
  onPathSelected?: (path: string) => void | Promise<void>;
  onRemoveFile?: () => void;
  locale?: 'fr' | 'en';
}

export const DocumentDropzone: React.FC<DocumentDropzoneProps> = ({
  id = 'doc-dropzone',
  label,
  title,
  subtitle,
  accept = '.pdf,.png,.jpg,.jpeg,.webp',
  currentFile,
  fileSize,
  filePath,
  isScanning = false,
  scanStep,
  confidenceScore,
  onFileSelected,
  onPathSelected,
  onRemoveFile,
  locale = 'fr',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [manualPath, setManualPath] = useState(filePath || '');
  const [pathInputOpen, setPathInputOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFr = locale === 'fr';

  // DRAG & DROP HANDLERS
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if leaving the main container
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      onFileSelected(file);
    }
  };

  // FILE INPUT CHANGE
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
    // Reset file input so the same file can be re-selected if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // MANUAL PATH SUBMIT
  const handleManualPathSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = manualPath.trim();
    if (!trimmed) return;
    if (onPathSelected) {
      onPathSelected(trimmed);
    }
  };

  const defaultTitle = isFr
    ? 'Déposez votre Extrait Kbis (France) ou RCCM (Afrique)'
    : 'Upload your Company Registration Document (Kbis / RCCM)';

  const defaultSubtitle = isFr
    ? 'PDF, PNG, JPG, WEBP • Extraction immédiate des métadonnées légales par OCR'
    : 'PDF, PNG, JPG, WEBP • Instant legal metadata extraction via OCR';

  return (
    <div className="space-y-4">
      {label && (
        <label className="block text-xs font-black uppercase text-[#D4AF37] tracking-wider">
          {label}
        </label>
      )}

      {/* 1. FICHIER EN COURS DE SCAN OCR */}
      {isScanning ? (
        <div className="p-8 rounded-2xl border-2 border-[#D4AF37]/50 bg-slate-900/90 text-center space-y-4 shadow-[0_0_30px_rgba(212,175,55,0.25)] animate-pulse">
          <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center mx-auto text-[#E5A93C]">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white flex items-center justify-center gap-2">
              <Scan className="w-5 h-5 text-emerald-400" />
              {isFr ? 'Lecture optique OCR en cours...' : 'OCR optical recognition in progress...'}
            </h4>
            <p className="text-xs text-slate-300 mt-1">
              {scanStep || (isFr ? 'Extraction des données légales de l\'entreprise' : 'Extracting official legal data')}
            </p>
          </div>
          <div className="w-48 h-1.5 bg-slate-800 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#D4AF37] to-emerald-400 rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      ) : currentFile ? (
        /* 2. FICHIER CHARGÉ ET PRÊT (APERÇU ET GESTION) */
        <div className="p-5 rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-br from-slate-900/90 to-emerald-950/30 shadow-[0_0_20px_rgba(16,185,129,0.2)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-sm">
              <FileCheck className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  {isFr ? 'Document Prêt' : 'Document Ready'}
                </span>
                {confidenceScore && (
                  <span className="text-[11px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-500/30">
                    ★ OCR {confidenceScore}%
                  </span>
                )}
                {fileSize && (
                  <span className="text-xs text-slate-400 font-mono">
                    {fileSize}
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-white truncate mt-1">
                {currentFile}
              </p>
              {filePath && (
                <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5" title={filePath}>
                  📁 {filePath}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {/* Bouton pour remplacer par clic */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              {isFr ? 'Remplacer' : 'Replace'}
            </button>

            {/* Bouton pour supprimer */}
            {onRemoveFile && (
              <button
                type="button"
                onClick={onRemoveFile}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-700/60 transition-colors"
                title={isFr ? 'Supprimer le document' : 'Remove document'}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* 3. ZONE DE DÉPÔT INTERACTIVE (CLIK + GLISSER-DÉPOSER) */
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-300 relative group ${
            isDragging
              ? 'border-amber-400 bg-amber-500/15 shadow-[0_0_35px_rgba(212,175,55,0.45)] scale-[1.01]'
              : 'border-slate-700 hover:border-[#D4AF37] bg-slate-900/70 hover:bg-slate-900/90 shadow-sm'
          }`}
        >
          <input
            id={id}
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 ${
                isDragging
                  ? 'bg-amber-400 text-slate-950 scale-110 shadow-[0_0_20px_rgba(212,175,55,0.6)]'
                  : 'bg-slate-800 text-[#D4AF37] group-hover:scale-110 group-hover:bg-[#D4AF37]/20'
              }`}
            >
              {isDragging ? (
                <Sparkles className="w-7 h-7 animate-spin" />
              ) : (
                <Upload className="w-7 h-7" />
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm sm:text-base font-extrabold text-white">
                {isDragging
                  ? (isFr ? 'Relâchez le document pour l\'importer !' : 'Release document to upload!')
                  : (title || defaultTitle)}
              </p>
              <p className="text-xs text-[#E5A93C] font-semibold">
                {isFr
                  ? 'Glissez-déposez ici ou cliquez pour parcourir vos fichiers'
                  : 'Drag & drop here or click to browse files'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {subtitle || defaultSubtitle}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. EN PLUS DU CHEMIN : SAISIE MANUELLE OU COLLER UN CHEMIN / URL */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <FolderOpen className="w-4 h-4 text-[#D4AF37]" />
            <span>
              {isFr
                ? 'Option : Indiquer le chemin ou lien du document'
                : 'Option: Specify file path or document link'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setPathInputOpen(!pathInputOpen)}
            className="text-[11px] font-bold text-[#E5A93C] hover:underline"
          >
            {pathInputOpen
              ? (isFr ? 'Masquer' : 'Hide')
              : (isFr ? 'Saisir un chemin...' : 'Enter a path...')}
          </button>
        </div>

        {pathInputOpen && (
          <form
            onSubmit={handleManualPathSubmit}
            className="flex flex-col sm:flex-row items-stretch gap-2 pt-1"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={manualPath}
                onChange={(e) => setManualPath(e.target.value)}
                placeholder={
                  isFr
                    ? 'Ex: C:\\Documents\\Kbis.pdf ou https://mon-site.com/doc.pdf'
                    : 'E.g., C:\\Documents\\Kbis.pdf or https://my-site.com/doc.pdf'
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              />
            </div>
            <button
              type="submit"
              disabled={!manualPath.trim()}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] disabled:opacity-50 hover:brightness-110 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
              <span>{isFr ? 'Valider le chemin' : 'Apply Path'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Copy, Check, Download, Terminal, FileCode, Cpu, Layers } from 'lucide-react';
import JSZip from 'jszip';
import { PYTORCH_CODEBASE, PyTorchFile } from '../pytorch_export/pytorchCodebase';

interface PyTorchCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PyTorchCodeModal: React.FC<PyTorchCodeModalProps> = ({ isOpen, onClose }) => {
  const [selectedFileName, setSelectedFileName] = useState<string>('README.md');
  const [copiedFile, setCopiedFile] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  if (!isOpen) return null;

  const activeFile = PYTORCH_CODEBASE.find((f) => f.name === selectedFileName) || PYTORCH_CODEBASE[0];

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(activeFile.code);
      setCopiedFile(true);
      setTimeout(() => setCopiedFile(false), 2000);
    } catch {
      // Fallback
      setCopiedFile(false);
    }
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('iamdinosaur-2026-pytorch');

      PYTORCH_CODEBASE.forEach((file) => {
        if (folder) {
          folder.file(file.name, file.code);
        }
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'iamdinosaur-2026-pytorch.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Failed to generate zip', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div
      id="pytorch-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-6"
    >
      <div
        id="pytorch-modal-container"
        className="flex flex-col w-full max-w-5xl h-[88vh] rounded-2xl border border-slate-800 bg-slate-950 text-slate-100 shadow-2xl shadow-cyan-950/30 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-mono text-sm sm:text-base font-bold text-slate-100">
                  Repositório PyTorch 2.x — IAMDinosaur 2026
                </h2>
                <span className="rounded bg-orange-500/20 border border-orange-500/30 px-1.5 py-0.5 text-[10px] font-mono text-orange-300 font-semibold">
                  OPEN SOURCE & SCALABLE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                IA Criadora (Adversarial WGAN) + IA Superadora (PPO + Genética) + IA Jogadora (Gym & Vision)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-download-pytorch-zip"
              type="button"
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono text-xs font-semibold px-3 py-1.5 transition-colors shadow-sm disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>{isZipping ? 'Compactando...' : 'Baixar ZIP (.zip)'}</span>
            </button>

            <button
              id="btn-close-pytorch-modal"
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content split: Sidebar file tree + Code viewer */}
        <div className="flex flex-1 min-h-0 flex-col md:flex-row">
          {/* File sidebar tabs */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/30 p-2 overflow-y-auto space-y-1">
            <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Layers className="h-3 w-3" /> Arquivos PyTorch
            </div>
            {PYTORCH_CODEBASE.map((file) => {
              const isActive = file.name === selectedFileName;
              return (
                <button
                  key={file.name}
                  id={`tab-file-${file.name}`}
                  type="button"
                  onClick={() => setSelectedFileName(file.name)}
                  className={`w-full text-left rounded-lg px-2.5 py-2 text-xs font-mono transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className={`h-3.5 w-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <span className="text-[10px] opacity-60 ml-1">{file.language}</span>
                </button>
              );
            })}

            {/* Quick terminal guide card */}
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-[11px] font-mono text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1 text-slate-300 font-semibold">
                <Terminal className="h-3 w-3 text-cyan-400" /> Executar Treino
              </div>
              <p className="text-[10px] text-slate-500">Comando padrão após extrair:</p>
              <div className="rounded bg-slate-900 p-1.5 text-[10px] text-cyan-300 select-all overflow-x-auto">
                python train_multiagent.py --device cuda
              </div>
            </div>
          </div>

          {/* Active File Code View */}
          <div className="flex-1 flex flex-col min-h-0 bg-[#090d16]">
            {/* File info bar */}
            <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60 px-4 py-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-200">{activeFile.name}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400 text-[11px]">{activeFile.description}</span>
              </div>

              <button
                id="btn-copy-file-code"
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs text-slate-200 transition-colors"
              >
                {copiedFile ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                    <span>Copiar Código</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Body */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-300 leading-relaxed">
              <pre className="select-text whitespace-pre-wrap">{activeFile.code}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  RefreshCw,
  Upload,
  X,
} from "lucide-react";

import CMSModal from "./Common/CMSModal";
import CMSButton from "./Common/CMSButton";
import { useToast } from "../../hooks/useToast";
import { PricelistItem } from "../../types";
import {
  ImportService,
  ImportResult,
  ImportRow,
  downloadPortfolioTemplate,
  isExcelFile,
  parsePortfolioExcel,
} from "../../utils/portfolioImport";

interface PortfolioImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (rows: ImportRow[]) => Promise<boolean>;
  services: ImportService[];
  pricelists: PricelistItem[];
}

const PortfolioImportModal: React.FC<PortfolioImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  services,
  pricelists,
}) => {
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setResult(null);
      setFileError(null);
    }
  }, [isOpen]);

  const handleFile = async (selected: File | undefined) => {
    if (!selected) return;
    if (!isExcelFile(selected)) {
      setFile(null);
      setResult(null);
      setFileError("File harus berformat Excel (.xlsx atau .xls).");
      return;
    }

    setFile(selected);
    setFileError(null);
    setParsing(true);
    try {
      setResult(await parsePortfolioExcel(selected, services, pricelists));
    } catch (err: any) {
      setResult(null);
      setFileError(`Gagal membaca file: ${err.message}`);
    } finally {
      setParsing(false);
    }
  };

  const handleDownloadTemplate = async () => {
    setDownloading(true);
    try {
      await downloadPortfolioTemplate(services, pricelists);
    } catch (err: any) {
      addToast(`Gagal membuat template: ${err.message}`, "error");
    } finally {
      setDownloading(false);
    }
  };

  const rows = result?.rows ?? [];
  const validRows = rows.filter((r) => r.errors.length === 0);
  const errorCount = rows.length - validRows.length;
  const serviceLabel = (id: number) => services.find((svc) => svc.id === id)?.title ?? String(id);

  const handleImport = async () => {
    if (validRows.length === 0) return;
    setImporting(true);
    try {
      const ok = await onImport(validRows);
      if (ok) onClose();
    } finally {
      setImporting(false);
    }
  };

  const footer = (
    <div className="flex items-center justify-between gap-3 w-full">
      <CMSButton
        variant="ghost"
        type="button"
        icon={Download}
        loading={downloading}
        onClick={handleDownloadTemplate}
      >
        Download Template
      </CMSButton>
      <div className="flex items-center gap-3">
        <CMSButton variant="ghost" type="button" onClick={onClose}>
          Batal
        </CMSButton>
        <CMSButton
          type="button"
          icon={Upload}
          loading={importing}
          disabled={validRows.length === 0 || parsing}
          onClick={handleImport}
        >
          {validRows.length > 0 ? `Import ${validRows.length} Data` : "Import"}
        </CMSButton>
      </div>
    </div>
  );

  return (
    <CMSModal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Portfolio dari Excel"
      footer={footer}
      maxWidth={result && rows.length > 0 ? "max-w-6xl" : "max-w-xl"}
    >
      <div className="space-y-4">
        {/* File picker */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className="w-full rounded-[14px] border border-dashed border-ink/20 bg-paper hover:bg-ink/5 transition-colors cursor-pointer px-4 py-6 flex flex-col items-center justify-center gap-1.5 text-center"
        >
          {file ? (
            <>
              <FileSpreadsheet size={24} className="text-emerald-500" />
              <span className="text-sm font-bold text-ink">{file.name}</span>
              <span className="text-[11px] text-ink/45 flex items-center gap-1">
                <RefreshCw size={11} /> Klik untuk pilih file lain
              </span>
            </>
          ) : (
            <>
              <FileSpreadsheet size={24} className="text-ink/30" />
              <span className="text-sm font-bold text-ink/70">
                Klik atau drop file Excel di sini
              </span>
              <span className="text-[11px] text-ink/45">
                Format .xlsx / .xls. Gunakan template agar kolom sesuai.
              </span>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        {parsing && (
          <p className="text-xs text-muted text-center">Memverifikasi file...</p>
        )}

        {fileError && (
          <div className="flex items-start gap-2 rounded-[10px] border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{fileError}</span>
          </div>
        )}

        {result?.fileErrors.map((msg) => (
          <div
            key={msg}
            className="flex items-start gap-2 rounded-[10px] border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600"
          >
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{msg}</span>
          </div>
        ))}

        {result?.fileWarnings.map((msg) => (
          <div
            key={msg}
            className="flex items-start gap-2 rounded-[10px] border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700"
          >
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>{msg}</span>
          </div>
        ))}

        {/* Preview */}
        {rows.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-muted">{rows.length} baris</span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={12} /> {validRows.length} valid
              </span>
              {errorCount > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-600">
                  <X size={12} /> {errorCount} error (tidak di-import)
                </span>
              )}
            </div>

            <div className="max-h-[50vh] overflow-auto rounded-[14px] border border-ink/10 custom-scrollbar">
              <table className="w-full text-xs">
                <thead className="bg-paper sticky top-0 z-10">
                  <tr className="text-left text-muted">
                    {["Baris", "Status", "Layanan", "Judul", "Link", "Tags", "Tools", "Role", "Urutan", "Pricelist", "Keterangan"].map(
                      (h) => (
                        <th key={h} className="px-3 py-2 font-bold whitespace-nowrap">
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const hasError = row.errors.length > 0;
                    return (
                      <tr
                        key={row.rowNumber}
                        className={`border-t border-ink/[0.06] align-top ${hasError ? "bg-rose-50/50" : ""}`}
                      >
                        <td className="px-3 py-2 text-ink/45">{row.rowNumber}</td>
                        <td className="px-3 py-2">
                          {hasError ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 font-semibold">
                              <AlertCircle size={11} /> Error
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 font-bold">
                              <CheckCircle2 size={11} /> Valid
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-ink">
                          {row.item.service_id ? serviceLabel(row.item.service_id) : row.raw.layanan || "-"}
                        </td>
                        <td className="px-3 py-2 min-w-[160px] text-ink font-medium">
                          {row.raw.title || <span className="text-ink/30">-</span>}
                        </td>
                        <td className="px-3 py-2 max-w-[180px] truncate text-muted" title={row.raw.linkurl}>
                          {row.raw.linkurl || <span className="text-ink/30">-</span>}
                        </td>
                        <td className="px-3 py-2 min-w-[120px] text-muted">
                          {row.item.tags.join(", ") || <span className="text-ink/30">-</span>}
                        </td>
                        <td className="px-3 py-2 min-w-[100px] text-muted">
                          {row.item.tools.join(", ") || <span className="text-ink/30">-</span>}
                        </td>
                        <td className="px-3 py-2 min-w-[100px] text-muted">
                          {row.raw.role || <span className="text-ink/30">-</span>}
                        </td>
                        <td className="px-3 py-2 text-muted">
                          {row.orderIndex ?? <span className="text-ink/30">-</span>}
                        </td>
                        <td className="px-3 py-2 min-w-[120px] text-muted">
                          {row.pricelistName || row.raw.pricelist || <span className="text-ink/30">-</span>}
                        </td>
                        <td className="px-3 py-2 min-w-[220px]">
                          {row.errors.map((msg) => (
                            <p key={msg} className="text-rose-600">• {msg}</p>
                          ))}
                          {row.warnings.map((msg) => (
                            <p key={msg} className="text-amber-600">• {msg}</p>
                          ))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </CMSModal>
  );
};

export default PortfolioImportModal;

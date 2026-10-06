import type { PricelistItem } from "../types";
import { LEGACY_WORK_CATEGORY_TO_SERVICE } from "../components/landing/useLandingData";

// SheetJS is only needed by the import modal, so load it on demand
const loadXLSX = () => import("xlsx");

export interface ImportService {
  id: number;
  slug: string;
  title: string;
}

export const IMPORT_COLUMNS = [
  { key: "title", required: false, desc: "Judul project (opsional)", example: "Illustrated Map — Jungle Track" },
  { key: "description", required: false, desc: "Deskripsi singkat (opsional)", example: "Ilustrasi peta interaktif bertema edukasi." },
  { key: "layanan", required: true, desc: "Wajib. Slug, nama, atau ID layanan, lihat sheet Referensi", example: "social-media" },
  { key: "tags", required: false, desc: "Pisahkan dengan koma", example: "Illustration, Map Design, Education" },
  { key: "linkurl", required: false, desc: "Link Gallery / Drive / Canva (opsional, harus URL valid)", example: "https://www.canva.com/design/XXXX/view?embed" },
  { key: "imgalt", required: false, desc: "Alt text gambar untuk SEO (opsional)", example: "Jungle Track Map" },
  { key: "role", required: false, desc: "Role / posisi (opsional)", example: "Visual Designer & Illustrator" },
  { key: "tools", required: false, desc: "Pisahkan dengan koma", example: "Adobe Illustrator, Photoshop" },
  { key: "order_index", required: false, desc: "Posisi urutan dalam layanan, mulai dari 0 (opsional, kosong = paling bawah)", example: "" },
  { key: "pricelist", required: false, desc: "Contoh hasil paket: nama paket, slug, atau ID (opsional), lihat sheet Referensi", example: "" },
] as const;

type ColumnKey = (typeof IMPORT_COLUMNS)[number]["key"];

// Columns that may appear in an exported sheet but are never imported
const IGNORED_COLUMNS = ["id", "image", "created_at", "pricelist_id", "service_id"];

// Templates downloaded before portfolios moved to services have a "category" column instead of "layanan"
const LEGACY_SERVICE_COLUMN = "category";

export interface ImportRow {
  rowNumber: number; // Excel row number (header = row 1)
  raw: Record<ColumnKey, string>;
  item: {
    title: string;
    description: string;
    service_id: number | null;
    tags: string[];
    linkurl: string;
    imgalt: string;
    role: string;
    tools: string[];
    image: null;
    pricelist_id: string | null;
  };
  orderIndex: number | null;
  pricelistName: string | null;
  errors: string[];
  warnings: string[];
}

export interface ImportResult {
  fileErrors: string[];
  fileWarnings: string[];
  rows: ImportRow[];
}

const splitList = (value: string) =>
  value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const isExcelFile = (file: File) => /\.(xlsx|xls)$/i.test(file.name);

export const parsePortfolioExcel = async (
  file: File,
  services: ImportService[],
  pricelists: PricelistItem[],
): Promise<ImportResult> => {
  const XLSX = await loadXLSX();
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const sheetName = workbook.SheetNames.includes("Portfolio")
    ? "Portfolio"
    : workbook.SheetNames[0];
  const sheet = sheetName ? workbook.Sheets[sheetName] : undefined;

  if (!sheet) {
    return { fileErrors: ["File tidak memiliki sheet."], fileWarnings: [], rows: [] };
  }

  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    blankrows: false,
    raw: false,
  });

  if (matrix.length === 0) {
    return { fileErrors: ["Sheet kosong."], fileWarnings: [], rows: [] };
  }

  // Verify header columns
  const headers = (matrix[0] || [])
    .map((h) => String(h).trim().toLowerCase())
    // Old templates: treat "category" as "layanan" (values are mapped below)
    .map((h, _, all) => (h === LEGACY_SERVICE_COLUMN && !all.includes("layanan") ? "layanan" : h));
  const expected = IMPORT_COLUMNS.map((c) => c.key as string);
  const missing = expected.filter((key) => !headers.includes(key));
  const unknown = headers.filter(
    (h) => h && !expected.includes(h) && !IGNORED_COLUMNS.includes(h),
  );

  const fileErrors: string[] = [];
  const fileWarnings: string[] = [];
  if (missing.length > 0) {
    fileErrors.push(
      `Kolom tidak lengkap. Kolom yang hilang: ${missing.join(", ")}. Gunakan template terbaru.`,
    );
  }
  if (unknown.length > 0) {
    fileWarnings.push(`Kolom tidak dikenal akan diabaikan: ${unknown.join(", ")}.`);
  }
  if (fileErrors.length > 0) return { fileErrors, fileWarnings, rows: [] };

  const colIndex = Object.fromEntries(expected.map((key) => [key, headers.indexOf(key)])) as Record<
    ColumnKey,
    number
  >;

  const rows: ImportRow[] = [];
  matrix.slice(1).forEach((cells, i) => {
    const raw = Object.fromEntries(
      expected.map((key) => [key, String(cells[colIndex[key as ColumnKey]] ?? "").trim()]),
    ) as Record<ColumnKey, string>;

    // Skip fully empty rows
    if (Object.values(raw).every((v) => v === "")) return;

    const errors: string[] = [];
    const warnings: string[] = [];

    // Service: accept slug, title or id (case-insensitive), plus old portfolio category ids
    let serviceId: number | null = null;
    if (!raw.layanan) {
      errors.push("Layanan wajib diisi.");
    } else {
      const needle = raw.layanan.toLowerCase();
      const slug = LEGACY_WORK_CATEGORY_TO_SERVICE[needle] ?? needle;
      const match = services.find(
        (svc) => svc.slug.toLowerCase() === slug || svc.title.toLowerCase() === needle || String(svc.id) === needle,
      );
      if (match) {
        serviceId = match.id;
      } else {
        errors.push(
          `Layanan "${raw.layanan}" tidak dikenal. Pilihan: ${services.map((svc) => svc.slug).join(", ")}.`,
        );
      }
    }

    if (raw.linkurl && !isHttpUrl(raw.linkurl)) {
      errors.push(`Link "${raw.linkurl}" bukan URL valid (harus diawali http:// atau https://).`);
    }
    if (!raw.linkurl) {
      warnings.push("Tanpa link gambar, kartu akan tampil placeholder. Upload gambar via Edit setelah import.");
    }

    let orderIndex: number | null = null;
    if (raw.order_index) {
      const n = Number(raw.order_index);
      if (Number.isInteger(n) && n >= 0) {
        orderIndex = n;
      } else {
        errors.push(`order_index "${raw.order_index}" harus bilangan bulat ≥ 0.`);
      }
    }

    // Pricelist: match by service name, slug, or id (case-insensitive)
    let pricelistId: string | null = null;
    let pricelistName: string | null = null;
    if (raw.pricelist) {
      const needle = raw.pricelist.toLowerCase();
      const matches = pricelists.filter(
        (p) =>
          String(p.id ?? "").toLowerCase() === needle ||
          String((p as any).slug ?? "").toLowerCase() === needle ||
          p.servicename.toLowerCase() === needle,
      );
      if (matches.length === 1) {
        pricelistId = String(matches[0].id);
        pricelistName = matches[0].servicename;
      } else if (matches.length > 1) {
        errors.push(
          `Pricelist "${raw.pricelist}" cocok dengan ${matches.length} layanan. Gunakan slug atau ID.`,
        );
      } else {
        errors.push(`Pricelist "${raw.pricelist}" tidak ditemukan.`);
      }
    }

    rows.push({
      rowNumber: i + 2,
      raw,
      item: {
        title: raw.title,
        description: raw.description,
        service_id: serviceId,
        tags: splitList(raw.tags),
        linkurl: raw.linkurl,
        imgalt: raw.imgalt,
        role: raw.role,
        tools: splitList(raw.tools),
        image: null,
        pricelist_id: pricelistId,
      },
      orderIndex,
      pricelistName,
      errors,
      warnings,
    });
  });

  if (rows.length === 0) {
    fileErrors.push("Tidak ada baris data di bawah header.");
  }

  return { fileErrors, fileWarnings, rows };
};

export const downloadPortfolioTemplate = async (
  services: ImportService[],
  pricelists: PricelistItem[],
) => {
  const XLSX = await loadXLSX();
  const workbook = XLSX.utils.book_new();

  const dataSheet = XLSX.utils.aoa_to_sheet([
    IMPORT_COLUMNS.map((c) => c.key),
    IMPORT_COLUMNS.map((c) => c.example),
  ]);
  dataSheet["!cols"] = IMPORT_COLUMNS.map((c) => ({
    wch: c.key === "description" || c.key === "linkurl" ? 45 : 24,
  }));
  XLSX.utils.book_append_sheet(workbook, dataSheet, "Portfolio");

  const guideSheet = XLSX.utils.aoa_to_sheet([
    ["Kolom", "Wajib", "Keterangan"],
    ...IMPORT_COLUMNS.map((c) => [c.key, c.required ? "Ya" : "Tidak", c.desc]),
    [],
    ["Catatan"],
    ["- Isi data mulai baris 2 di sheet Portfolio. Hapus baris contoh sebelum import."],
    ["- Jangan ubah nama kolom di baris header."],
    ["- Gambar tidak bisa di-import. Upload gambar via Edit setelah import, atau isi linkurl."],
  ]);
  guideSheet["!cols"] = [{ wch: 16 }, { wch: 8 }, { wch: 80 }];
  XLSX.utils.book_append_sheet(workbook, guideSheet, "Petunjuk");

  const refRows: (string | number)[][] = [["Layanan (slug)", "Nama Layanan", "", "Paket", "Slug", "ID", "Layanan Paket"]];
  const max = Math.max(services.length, pricelists.length);
  for (let i = 0; i < max; i++) {
    const c = services[i];
    const p = pricelists[i];
    refRows.push([
      c?.slug ?? "",
      c?.title ?? "",
      "",
      p?.servicename ?? "",
      (p as any)?.slug ?? "",
      p?.id ?? "",
      p ? p.service?.title ?? "Lainnya" : "",
    ]);
  }
  const refSheet = XLSX.utils.aoa_to_sheet(refRows);
  refSheet["!cols"] = [{ wch: 16 }, { wch: 24 }, { wch: 3 }, { wch: 36 }, { wch: 24 }, { wch: 8 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(workbook, refSheet, "Referensi");

  XLSX.writeFile(workbook, "template-import-portfolio.xlsx");
};

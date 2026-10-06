import { z } from "zod";

// --- Order Modal ---
export const orderSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  whatsapp: z.string().regex(/^\d+$/, "Nomor WhatsApp hanya boleh berisi angka").min(9, "Nomor WhatsApp tidak valid"),
  selected_package: z.string().min(1, "Silakan pilih kebutuhan desain"),
  design_category: z.string().optional(),
  brief: z.string().min(10, "Brief terlalu singkat (minimal 10 karakter)"),
  deadline: z.string().min(1, "Silakan tentukan deadline"),
  voucher_code: z.string().regex(/^[a-zA-Z0-9]*$/, "Kode voucher hanya boleh berisi huruf dan angka").optional(),
});
export type OrderFormData = z.infer<typeof orderSchema>;

// --- Portfolio Modal ---
export const portfolioSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    tags: z.string().optional(),
    imgalt: z.string().optional(),
    // Either an uploaded image (Vercel Blob URL) or a gallery/drive link — never both.
    sourceMode: z.enum(["upload", "url"]),
    linkurl: z.string().url("Format URL tidak valid").optional().or(z.literal("")),
    image: z.string().nullable().optional(), // Pending file is validated in the modal before upload
    role: z.string().optional(),
    tools: z.string().optional(),
    service_id: z.string().min(1, "Layanan wajib dipilih"),
    pricelist_id: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.sourceMode === "url" && !data.linkurl) {
      ctx.addIssue({ code: "custom", path: ["linkurl"], message: "Link Gallery / Drive wajib diisi" });
    }
  });
export type PortfolioFormData = z.infer<typeof portfolioSchema>;

// --- Pricelist Modal ---
export const pricelistSchema = z.object({
  slug: z.string().min(2, "Slug minimal 2 karakter"),
  servicename: z.string().min(3, "Nama layanan minimal 3 karakter"),
  description: z.string().min(5, "Deskripsi minimal 5 karakter"),
  retailprice: z.number({ message: "Harga harus berupa angka" }).min(0, "Harga tidak boleh negatif"),
  finalprice: z.number({ message: "Harga harus berupa angka" }).min(0, "Harga tidak boleh negatif"),
  duration: z.number({ message: "Durasi harus berupa angka" }).min(1, "Durasi minimal 1 hari"),
  totalrevision: z.number().optional(), // Can be 0 if unlimited
  isrevisionunlimited: z.boolean(),
  isShowToCustomer: z.boolean(),
  service_id: z.string().optional(), // select value; "" = no service
  // deliverables array is managed separately in state in the component
});
export type PricelistFormData = z.infer<typeof pricelistSchema>;

// --- Services Modal ---
export const servicesSchema = z.object({
  slug: z.string().min(2, "Slug minimal 2 karakter"),
  title: z.string().min(3, "Nama layanan minimal 3 karakter"),
  description: z.string().min(5, "Deskripsi minimal 5 karakter"),
  // Kept for the DB columns; no longer edited in the form
  icon: z.string().optional(),
  category: z.string().optional(),
  color: z.string().optional(),
  // included array is managed separately in state in the component
});
export type ServicesFormData = z.infer<typeof servicesSchema>;

// --- Fastwork Modal ---
export const fastworkSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  url: z.string().url("Format URL tidak valid"),
  image: z.string().min(1, "URL Gambar wajib diisi").url("Format URL gambar tidak valid"),
  rating: z.number({ message: "Rating harus berupa angka" }).min(0).max(5, "Rating maksimal 5"),
  rehire: z.boolean(),
  installment: z.boolean(),
  delay: z.string().optional(),
});
export type FastworkFormData = z.infer<typeof fastworkSchema>;

// --- Testimonial Modal ---
export const testimonialSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  title: z.string().min(2, "Gelar/Jabatan minimal 2 karakter"),
  rating: z.number().min(1).max(5),
  testimony: z.string().min(10, "Testimoni minimal 10 karakter"),
  is_show: z.boolean(),
  avatar_url: z.string().optional(),
});
export type TestimonialFormData = z.infer<typeof testimonialSchema>;

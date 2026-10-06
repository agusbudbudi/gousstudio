import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../utils/supabase";
import { resolveImageUrl } from "../../utils/imageResolver";
import type { FastworkItem, PortfolioItem, TestimonialItem } from "../../types";
import { FALLBACK_CLIENTS, FALLBACK_TESTIMONIALS } from "./content";

const STALE = 5 * 60 * 1000;
const RETRY = 1;

// hasTitle=false means the CMS title was empty and `title` holds a generic fallback.
export type WorkItem = PortfolioItem & { src: string; hasTitle: boolean };

export type PackageService = { id: number; slug: string; title: string; order: number };

// Packages without a service (custom ones) are grouped under this pseudo-service
export const OTHER_GROUP = { slug: "lainnya", title: "Lainnya" } as const;

export type PackageItem = {
  id: number;
  // Parent service; null for packages without one (e.g. custom packages)
  service: PackageService | null;
  slug: string;
  // Package name (pricelists.servicename)
  serviceName: string;
  // Group label shown on cards, tabs and orders: the service title, or "Lainnya"
  category: string;
  // Group key used for filters and ?cat= links: the service slug, or "lainnya"
  categorySlug: string;
  description: string;
  finalPrice: number;
  retailPrice: number;
  duration: number;
  isRevisionUnlimited: boolean;
  totalRevision: number;
  deliverables: string[];
};

const withImage = (items: WorkItem[]) => items.filter((item) => item.src);

// Portfolio rows are fetched with their parent service embedded (portfolios.service_id -> services)
const WORK_SELECT = "*, service:services(id, slug, title, order_index)";

/**
 * Select portfolio rows with their service; if the relationship doesn't exist yet (migration not run,
 * PostgREST PGRST200) fall back to plain rows so images still show — they just land in "Lainnya".
 */
const selectWorks = async (build: (select: string) => PromiseLike<{ data: any[] | null; error: any }>) => {
  const withService = await build(WORK_SELECT);
  if (withService.error?.code !== "PGRST200") return withService;
  return build("*");
};

const mapWorkRow = (row: any): WorkItem => {
  const rawTitle = String(row.title || "").trim();
  const service = row.service
    ? { id: Number(row.service.id), slug: row.service.slug, title: row.service.title, order: Number(row.service.order_index ?? 0) }
    : null;
  const item: PortfolioItem = {
    id: row.id,
    title: rawTitle || service?.title || "Project desain",
    description: row.description,
    service_id: service?.id ?? null,
    service,
    tags: row.tags || [],
    imgAlt: row.imgalt || "",
    linkUrl: row.linkurl || "",
    image: row.image || undefined,
    role: row.role || "",
    tools: row.tools || [],
    pricelist_id: row.pricelist_id ?? undefined,
  };
  return { ...item, src: resolveImageUrl(item, "w800") || "", hasTitle: Boolean(rawTitle) };
};

// ─── Work grouping (portfolio items belong to a service) ─────────────────────

export type WorkGroup = { slug: string; title: string; order: number };

/** The service a work belongs to, or the "Lainnya" group. */
export const workGroup = (work: PortfolioItem): WorkGroup =>
  work.service
    ? { slug: work.service.slug, title: work.service.title, order: work.service.order ?? 0 }
    : { ...OTHER_GROUP, order: Number.MAX_SAFE_INTEGER };

/** Services that have works, in CMS service order. */
export const workGroups = (works: PortfolioItem[]): WorkGroup[] => {
  const map = new Map<string, WorkGroup>();
  works.forEach((w) => {
    const g = workGroup(w);
    if (!map.has(g.slug)) map.set(g.slug, g);
  });
  return [...map.values()].sort((a, b) => a.order - b.order);
};

// Old /portfolio?cat= values (portfolio categories and the former landing filter ids) -> service slug
export const LEGACY_WORK_CATEGORY_TO_SERVICE: Record<string, string> = {
  poster: "poster",
  feed: "social-media",
  social: "social-media",
  logo: "logo",
  ecommerce: "digital-marketing",
  ads: "digital-marketing",
  digital: "digital-marketing",
  management: "social-media-management",
};

// Pricelist rows are fetched with their parent service embedded (pricelists.service_id -> services)
const PACKAGE_SELECT = "*, service:services(id, slug, title, order_index)";

const mapPackageRow = (row: any): PackageItem => {
  const service: PackageService | null = row.service
    ? { id: Number(row.service.id), slug: row.service.slug, title: row.service.title, order: Number(row.service.order_index ?? 0) }
    : null;
  return {
  id: Number(row.id),
  service,
  slug: row.slug || row.servicename || "",
  serviceName: row.servicename,
  category: service?.title ?? OTHER_GROUP.title,
  categorySlug: service?.slug ?? OTHER_GROUP.slug,
  description: row.description || "",
  finalPrice: Number(row.finalprice ?? 0),
  retailPrice: Number(row.retailprice ?? 0),
  duration: Number(row.duration ?? 0),
  isRevisionUnlimited: Boolean(row.isrevisionunlimited),
  totalRevision: Number(row.totalrevision ?? 0),
  deliverables: row.deliverables || [],
  };
};

// imageOnly=true drops items without a resolvable image (e.g. Canva embeds) — used on the landing page.
export function usePortfolio(imageOnly = true) {
  return useQuery({
    queryKey: ["landing", "portfolios"],
    select: imageOnly ? withImage : undefined,
    staleTime: STALE,
    retry: RETRY,
    queryFn: async (): Promise<WorkItem[]> => {
      const { data, error } = await selectWorks((select) =>
        supabase.from("portfolios").select(select).order("order_index", { ascending: true }),
      );
      if (error) throw error;
      return (data || []).map(mapWorkRow);
    },
  });
}

export function usePackages(enabled = true) {
  return useQuery({
    queryKey: ["landing", "pricelists"],
    enabled,
    staleTime: STALE,
    retry: RETRY,
    queryFn: async (): Promise<PackageItem[]> => {
      const { data, error } = await supabase
        .from("pricelists")
        .select(PACKAGE_SELECT)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return (data || [])
        .filter(
          (row: any) =>
            Boolean(row.is_show_to_customer) && row.servicename !== "Custom Package",
        )
        .map(mapPackageRow)
        // Group by service (CMS service order), then CMS package order; packages without a service last
        .sort((a, b) => (a.service?.order ?? Number.MAX_SAFE_INTEGER) - (b.service?.order ?? Number.MAX_SAFE_INTEGER));
    },
  });
}

export type LandingService = {
  id: number;
  slug: string;
  title: string;
  description: string;
  deliverables: string[];
};

export type ServicesData = {
  services: LandingService[];
};

/** Services (CMS-managed, in CMS order). */
export function useServices() {
  return useQuery({
    queryKey: ["landing", "services"],
    staleTime: STALE,
    retry: RETRY,
    queryFn: async (): Promise<ServicesData> => {
      const servicesRes = await supabase
        .from("services")
        .select("id, slug, title, description, included")
        .order("order_index", { ascending: true });
      if (servicesRes.error) throw servicesRes.error;
      return {
        services: (servicesRes.data || []).map((row: any) => ({
          id: Number(row.id),
          slug: row.slug,
          title: row.title,
          description: row.description || "",
          deliverables: row.included || [],
        })),
      };
    },
  });
}

// One package by slug (falls back to service name for rows without a slug) + its linked portfolio items.
export function usePackageDetail(slug: string | undefined) {
  return useQuery({
    queryKey: ["landing", "pricelist", slug],
    enabled: Boolean(slug),
    staleTime: STALE,
    retry: RETRY,
    queryFn: async (): Promise<{ pkg: PackageItem | null; works: WorkItem[] }> => {
      let { data: row, error } = await supabase.from("pricelists").select(PACKAGE_SELECT).eq("slug", slug).maybeSingle();
      if (error) throw error;
      if (!row) {
        const byName = await supabase.from("pricelists").select(PACKAGE_SELECT).eq("servicename", slug).maybeSingle();
        if (byName.error) throw byName.error;
        row = byName.data;
      }
      if (!row) return { pkg: null, works: [] };

      const { data: workRows, error: workError } = await selectWorks((select) =>
        supabase.from("portfolios").select(select).eq("pricelist_id", row.id).order("order_index", { ascending: true }),
      );
      if (workError) throw workError;

      return { pkg: mapPackageRow(row), works: (workRows || []).map(mapWorkRow) };
    },
  });
}

export function useClientLogos() {
  return useQuery({
    queryKey: ["landing", "client_logos"],
    staleTime: STALE,
    retry: RETRY,
    placeholderData: FALLBACK_CLIENTS,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_logos")
        .select("full_name, photo_url");
      if (error) throw error;
      const mapped = (data || [])
        .filter((row: any) => row.photo_url)
        .map((row: any) => ({ name: row.full_name as string, src: row.photo_url as string }));
      return mapped.length > 0 ? mapped : FALLBACK_CLIENTS;
    },
  });
}

export function useLandingTestimonials() {
  return useQuery({
    queryKey: ["landing", "testimonials"],
    staleTime: STALE,
    retry: RETRY,
    placeholderData: FALLBACK_TESTIMONIALS as TestimonialItem[],
    queryFn: async (): Promise<TestimonialItem[]> => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_show", true)
        .order("order_index", { ascending: true });
      if (error) throw error;
      const rows = (data || []).map((row: any) => ({
        ...row,
        testimony: String(row.testimony || "").replace(/^["“]|["”]$/g, ""),
      }));
      return rows.length > 0 ? rows : (FALLBACK_TESTIMONIALS as TestimonialItem[]);
    },
  });
}

export function useFastwork() {
  return useQuery({
    queryKey: ["landing", "fastwork_items"],
    staleTime: STALE,
    retry: RETRY,
    queryFn: async (): Promise<FastworkItem[]> => {
      const { data, error } = await supabase
        .from("fastwork_items")
        .select("*")
        .order("id");
      if (error) throw error;
      return data || [];
    },
  });
}

export const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export interface PortfolioItem {
  id?: string;
  title: string;
  description: string;
  // Parent service (services.id); null when not assigned
  service_id?: number | null;
  // Embedded parent service, when fetched with `service:services(...)`
  service?: { id: number; slug: string; title: string; order?: number } | null;
  tags?: string[];
  image?: string;
  imgalt?: string;
  imgAlt?: string; // Standardize/Legacy
  emoji?: string;
  linkurl?: string;
  linkUrl?: string; // Legacy support
  role?: string;
  tools?: string[];
  order_index?: number;
  // Optional "example of this package" link
  pricelist_id?: string;
}

export interface PricelistItem {
  id?: string;
  servicename: string;
  description?: string;
  finalprice: number;
  retailprice?: number;
  duration?: number;
  isrevisionunlimited?: boolean;
  totalrevision?: number;
  order_index?: number;
  deliverables?: string[];
  isShowToCustomer?: boolean;
  // Parent service (services.id); null for packages without one
  service_id?: number | null;
  // Embedded parent service, when fetched with `service:services(...)`
  service?: { id: number; slug: string; title: string } | null;
}

/** A revision request the client sent from the order page. */
export interface RevisionNote {
  round: number;
  /** Empty when the revision was logged by an admin from the CMS. */
  notes: string;
  created_at: string;
  /** Snapshot of the draft link the client reviewed before asking for this revision. */
  review_url?: string | null;
  source?: "client" | "admin";
  /** Beyond the package's included revisions (may be charged). */
  extra?: boolean;
}

export interface OrderItem {
  id: string;
  order_number: string;
  full_name: string;
  phone_number: string;
  design_category: string;
  selected_package: string;
  brief_detail?: string | null;
  deadline?: string | null;
  price?: number | null;
  discount_value?: number | null;
  discount_type?: 'fixed' | 'percentage' | null;
  final_price?: number | null;
  status: 'DRAFT' | 'WAITING FOR PAYMENT' | 'IN PROGRESS' | 'REVISION' | 'REVIEWED' | 'DONE' | 'CANCELLED';
  payment_proof_url?: string | null;
  deliverables_url?: string | null;
  review_url?: string | null;
  revision_count?: number | null;
  revision_notes?: RevisionNote[] | null;
  approved_at?: string | null;
  internal_notes?: string | null;
  created_at: string;
  source_order?: string | null;
  client_id?: string | null;
  payment_method?: string | null;
  paid_amount?: number | null;
  paid_at?: string | null;
  is_sandbox?: boolean | null;
  package_details?: PricelistItem;
  voucher_code?: string | null;
  referral_id?: string | null;
}

export interface ReferralCode {
  id: string;
  code: string;
  order_id: string;
  discount_value: number;
  discount_type: "fixed" | "percentage";
  is_used: boolean;
  created_at: string;
  orders?: {
    full_name: string;
    order_number: string;
  };
  used_on_order?: string;
}

export interface AppState {
  isOrderModalOpen: boolean;
  prefillData: any;
  openOrderModal: (data?: any) => void;
  closeOrderModal: () => void;
}

export interface FastworkItem {
  id?: string;
  title: string;
  url: string;
  image: string;
  rating: number;
  rehire: boolean;
  installment: boolean;
  delay: string;
  order_index?: number;
}

export interface ServiceItem {
  id?: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  color: string;
  included: string[];
  order_index?: number;
}

export interface ClientItem {
  id: string;
  client_no?: number;
  full_name: string;
  phone_number?: string;
  company?: string;
  notes?: string;
  photo_url?: string;
  magic_link_token?: string;
  created_at: string;
}

export interface TestimonialItem {
  id?: string;
  name: string;
  title: string;
  rating: number;
  testimony: string;
  avatar_url?: string;
  is_show: boolean;
  order_index?: number;
  created_at?: string;
  updated_at?: string;
}

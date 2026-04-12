export interface PortfolioItem {
  id?: string;
  title: string;
  description: string;
  category: string;
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
  pricelist_id?: string;
}

export interface PricelistItem {
  id?: string;
  servicename: string;
  category: string;
  description?: string;
  finalprice: number;
  retailprice?: number;
  duration?: number;
  isrevisionunlimited?: boolean;
  totalrevision?: number;
  order_index?: number;
  deliverables?: string[];
  isShowToCustomer?: boolean;
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
  status: 'DRAFT' | 'WAITING FOR PAYMENT' | 'IN PROGRESS' | 'REVISION' | 'REVIEWED' | 'DONE';
  payment_proof_url?: string | null;
  deliverables_url?: string | null;
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
  theme: string;
  toggleTheme: () => void;
  setTheme: (theme: string) => void;
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

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
  client_id?: string;
  order_number: string;
  full_name: string;
  phone_number: string;
  design_category: string;
  selected_package: string;
  brief_detail?: string;
  deadline?: string;
  price?: number;
  discount_value?: number;
  discount_type?: 'fixed' | 'percentage';
  final_price?: number;
  status: 'DRAFT' | 'WAITING FOR PAYMENT' | 'IN PROGRESS' | 'REVISION' | 'REVIEWED' | 'DONE';
  payment_proof_url?: string;
  deliverables_url?: string;
  internal_notes?: string;
  created_at: string;
  source_order?: string;
  payment_method?: string;
  paid_amount?: number;
  paid_at?: string;
  is_sandbox?: boolean | null;
  package_details?: PricelistItem;
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
  created_at: string;
}

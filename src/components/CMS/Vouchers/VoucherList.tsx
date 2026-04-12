import React, { useState } from "react";
import { Copy, Check, Calendar, ExternalLink } from "lucide-react";
import { ReferralCode } from "../../../types";
import {
  CMSTableContainer,
  CMSTableHeader,
  CMSTableHeaderCell,
  CMSTableRow,
  CMSTableCell,
} from "../Common/CMSTable";
import CMSEmptyState from "../Common/CMSEmptyState";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

interface VoucherListProps {
  referrals: ReferralCode[];
}

const VoucherList: React.FC<VoucherListProps> = ({ referrals }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (referrals.length === 0) {
    return (
      <CMSEmptyState
        icon={Calendar}
        title="Tidak ada voucher ditemukan"
        description="Voucher akan otomatis muncul di sini setelah client memberikan feedback untuk orderan mereka."
      />
    );
  }

  return (
    <CMSTableContainer>
      <CMSTableHeader>
        <CMSTableHeaderCell>Voucher Code</CMSTableHeaderCell>
        <CMSTableHeaderCell>Order Context</CMSTableHeaderCell>
        <CMSTableHeaderCell>Value</CMSTableHeaderCell>
        <CMSTableHeaderCell>Status</CMSTableHeaderCell>
        <CMSTableHeaderCell>Used On</CMSTableHeaderCell>
        <CMSTableHeaderCell align="right">Date Issued</CMSTableHeaderCell>
      </CMSTableHeader>
      <tbody className="divide-y divide-slate-100">
        {referrals.map((item) => (
          <CMSTableRow key={item.id}>
            <CMSTableCell>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-brand-600 bg-brand-50/50 px-3 py-1.5 rounded-lg border border-brand-100 text-sm">
                  {item.code}
                </span>
                <button
                  onClick={() => copyToClipboard(item.code, item.id)}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    copiedId === item.id
                      ? "bg-emerald-50 border-emerald-500/50 text-emerald-600"
                      : "bg-white border-slate-200 text-slate-400 hover:text-brand-600 hover:border-brand-500/50"
                  }`}
                  title="Salin Kode"
                >
                  {copiedId === item.id ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>
            </CMSTableCell>
            
            <CMSTableCell>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-slate-900 font-bold text-sm tracking-tight">
                    {item.orders?.full_name || "N/A"}
                  </span>
                  <a
                    href={`/cms/orders/${item.orders?.order_number}`}
                    className="text-brand-500 hover:scale-110 transition-all p-1 hover:bg-brand-50 rounded-md"
                    title="Lihat Detail Order"
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold">
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                    #{item.orders?.order_number || "ORDER-ERR"}
                  </span>
                </div>
              </div>
            </CMSTableCell>
            
            <CMSTableCell>
              <span className="text-emerald-600 font-black text-xs uppercase tracking-tight">
                {item.discount_value}% OFF
              </span>
            </CMSTableCell>
            
            <CMSTableCell>
              {item.is_used ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black tracking-widest uppercase bg-slate-100 text-slate-500 border border-slate-200">
                  USED
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black tracking-widest uppercase bg-emerald-50 text-emerald-600 border border-emerald-500/30">
                  ACTIVE
                </span>
              )}
            </CMSTableCell>

            <CMSTableCell>
              {item.is_used && item.used_on_order ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-900 font-bold text-[11px]">
                    #{item.used_on_order}
                  </span>
                  <a
                    href={`/cms/orders/${item.used_on_order}`}
                    className="text-brand-500 hover:scale-110 transition-all p-1 hover:bg-brand-50 rounded-md"
                    title="Lihat Order Pengguna"
                  >
                    <ExternalLink size={10} />
                  </a>
                </div>
              ) : (
                <span className="text-slate-300 text-[10px] uppercase font-bold tracking-wider">-</span>
              )}
            </CMSTableCell>
            
            <CMSTableCell align="right">
              <div className="flex flex-col items-end">
                <span className="text-slate-900 text-[11px] font-bold leading-none mb-1">
                  {formatDate(item.created_at)}
                </span>
                <span className="text-slate-400 text-[10px] font-medium leading-none">
                  {formatTime(item.created_at)}
                </span>
              </div>
            </CMSTableCell>
          </CMSTableRow>
        ))}
      </tbody>
    </CMSTableContainer>
  );
};

export default VoucherList;

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Ticket, RefreshCcw } from "lucide-react";
import CMSHeader from "./CMSHeader";
import VoucherList from "./Vouchers/VoucherList";
import CMSStatCard from "./Common/CMSStatCard";
import CMSSearchBar from "./Common/CMSSearchBar";

import { ReferralCode } from "../../types";

const VoucherCMS: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: referrals = [], isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["referrals"],
    queryFn: async () => {
      const res = await fetch("/api/orders?action=list-referrals");
      if (!res.ok) throw new Error("Failed to fetch referrals");
      const result = await res.json();
      return (result.data as ReferralCode[]) || [];
    }
  });

  const filteredReferrals = referrals.filter((ref) => {
    const search = searchQuery.toLowerCase();
    return (
      ref.code.toLowerCase().includes(search) ||
      ref.orders?.order_number?.toLowerCase().includes(search) ||
      ref.orders?.full_name?.toLowerCase().includes(search)
    );
  });

  const totalVouchers = referrals.length;
  const usedVouchers = referrals.filter(r => r.is_used).length;

  return (
    <div className="flex flex-col h-full">
      <CMSHeader
        title="Voucher Management"
        countText={`${totalVouchers} voucher terdaftar`}
      >
        <div className="flex items-center gap-2">
          <CMSSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Cari kode, order, atau client..."
            className="w-72"
          />
          
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-2.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-brand-600 hover:border-brand-500/50 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCcw size={18} className={isRefetching ? "animate-spin" : ""} />
          </button>
        </div>
      </CMSHeader>

      <div className="mt-6 mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <CMSStatCard
          label="TOTAL VOUCHER"
          value={totalVouchers}
          icon={Ticket}
          variant="brand"
        />
        
        <CMSStatCard
          label="SUDAH DIGUNAKAN"
          value={usedVouchers}
          icon={RefreshCcw}
          variant="neutral"
        />
      </div>

      <div className="flex-1 min-h-0 flex flex-col pt-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 size={40} className="text-brand-500 animate-spin mb-4" />
            <p className="text-slate-400 font-medium font-['Neue_Machina']">Memuat data voucher...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center max-w-md mx-auto mt-12">
            <p className="text-red-500 font-bold mb-2">Gagal memuat data</p>
            <p className="text-slate-500 text-sm">{(error as Error).message}</p>
          </div>
        ) : (
          <VoucherList referrals={filteredReferrals} />
        )}
      </div>
    </div>
  );
};

export default VoucherCMS;

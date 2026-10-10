import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Ticket, RefreshCcw } from "lucide-react";
import CMSTableSkeleton from "./Common/CMSTableSkeleton";
import CMSEmptyState from "./Common/CMSEmptyState";
import { AlertTriangle, RotateCw } from "lucide-react";
import CMSButton from "./Common/CMSButton";
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
      const res = await fetch("/api/cms/orders?action=list-referrals");
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
            className="p-2.5 rounded-[10px] border border-ink/10 bg-white text-muted hover:text-violet-700 hover:border-violet-600/50 transition-all cursor-pointer disabled:opacity-50"
            aria-label="Refresh Data" title="Refresh Data"
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
          <CMSTableSkeleton rows={6} columns={4} label="Memuat data voucher..." />
        ) : error ? (
          <CMSEmptyState
            icon={AlertTriangle}
            iconClassName="w-16 h-16 bg-rose-50 border border-rose-100 text-rose-500 rounded-[20px]"
            title="Voucher gagal dimuat"
            description={String((error as Error).message)}
            action={
              <CMSButton variant="secondary" icon={RotateCw} onClick={() => refetch()}>
                Coba lagi
              </CMSButton>
            }
          />
        ) : (
          <VoucherList referrals={filteredReferrals} />
        )}
      </div>
    </div>
  );
};

export default VoucherCMS;

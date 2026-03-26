import React from "react";

interface CMSTableProps {
  children?: React.ReactNode;
  className?: string;
}

export const CMSTableContainer: React.FC<CMSTableProps> = ({ children, className = "" }) => (
  <div className={`bg-white border border-slate-200 rounded-xl overflow-x-auto custom-scrollbar ${className}`}>
    <table className="w-full text-sm min-w-[800px]">
      {children}
    </table>
  </div>
);

export const CMSTableHeader: React.FC<CMSTableProps> = ({ children, className = "" }) => (
  <thead className="sticky top-0 z-20">
    <tr className={`border-b border-slate-100 bg-slate-50 shadow-sm ${className}`}>
      {children}
    </tr>
  </thead>
);

export const CMSTableHeaderCell: React.FC<CMSTableProps & { width?: string; align?: "left" | "right" | "center" }> = ({ 
  children, 
  className = "", 
  width,
  align = "left" 
}) => (
  <th 
    className={`px-6 py-3 text-[10px] uppercase tracking-wider font-bold text-slate-400 ${
      align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"
    } ${className}`}
    style={width ? { width } : undefined}
  >
    {children}
  </th>
);

export const CMSTableRow: React.FC<CMSTableProps & { onClick?: () => void }> = ({ 
  children, 
  className = "", 
  onClick 
}) => (
  <tr 
    onClick={onClick}
    className={`hover:bg-slate-50/60 transition-colors group ${onClick ? "cursor-pointer" : ""} ${className}`}
  >
    {children}
  </tr>
);

export const CMSTableCell: React.FC<CMSTableProps & { align?: "left" | "right" | "center" }> = ({ 
  children, 
  className = "", 
  align = "left" 
}) => (
  <td className={`px-6 py-4 ${align === "right" ? "text-right whitespace-nowrap" : align === "center" ? "text-center" : ""} ${className}`}>
    {children}
  </td>
);

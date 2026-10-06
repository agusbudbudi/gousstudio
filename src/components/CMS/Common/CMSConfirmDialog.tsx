import React, { useCallback, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import CMSModal from "./CMSModal";
import CMSButton from "./CMSButton";

export interface ConfirmOptions {
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

/**
 * Promise-based replacement for window.confirm, rendered with CMSModal.
 *
 *   const { confirm, confirmDialog } = useConfirm();
 *   if (!(await confirm({ title: "Hapus item ini?", destructive: true }))) return;
 *   ...
 *   return <>{...}{confirmDialog}</>;
 */
export const useConfirm = () => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    // Settle any dialog that is still open before showing a new one
    resolverRef.current?.(false);
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const settle = useCallback((value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setOptions(null);
  }, []);

  const confirmDialog = (
    <CMSModal
      isOpen={options !== null}
      onClose={() => settle(false)}
      title={options?.title ?? ""}
      maxWidth="max-w-md"
      footer={
        <>
          <CMSButton variant="ghost" type="button" onClick={() => settle(false)} autoFocus>
            {options?.cancelLabel ?? "Batal"}
          </CMSButton>
          <CMSButton
            variant={options?.destructive ? "destructive" : "primary"}
            type="button"
            onClick={() => settle(true)}
          >
            {options?.confirmLabel ?? (options?.destructive ? "Hapus" : "Lanjutkan")}
          </CMSButton>
        </>
      }
    >
      <div className="flex items-start gap-4">
        {options?.destructive && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-rose-100 bg-rose-50 text-rose-600">
            <AlertTriangle size={18} />
          </span>
        )}
        <p className="pt-1 text-sm leading-relaxed text-muted">
          {options?.description ?? "Tindakan ini tidak dapat dibatalkan."}
        </p>
      </div>
    </CMSModal>
  );

  return { confirm, confirmDialog };
};

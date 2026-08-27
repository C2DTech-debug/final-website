"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { AlertTriangle, ShieldAlert, Trash2 } from "lucide-react";
import type { Agreement } from "@/types";

interface AgreementDeleteDialogProps {
  agreement: Agreement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  pending?: boolean;
}

export function AgreementDeleteDialog({
  agreement,
  open,
  onOpenChange,
  onConfirm,
  pending = false,
}: AgreementDeleteDialogProps) {
  const [confirmInput, setConfirmInput] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setConfirmInput("");
    }
  }, [open]);

  if (!agreement) return null;

  const isSigned = agreement.status === "signed";
  const requiredConfirmationText = isSigned ? agreement.agreementNumber : "";
  const isValid = !isSigned || confirmInput.trim().toUpperCase() === requiredConfirmationText.toUpperCase();

  const handleConfirm = async () => {
    if (!isValid || pending) return;
    await onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                isSigned
                  ? "bg-destructive/15 text-destructive"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              }`}
            >
              {isSigned ? <ShieldAlert className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            </div>
            <div>
              <AlertDialogTitle className="text-base font-bold">
                {isSigned ? "Permanently Delete Signed Agreement?" : "Delete Agreement Draft?"}
              </AlertDialogTitle>
              <p className="font-mono text-xs text-muted-foreground">{agreement.agreementNumber}</p>
            </div>
          </div>

          <AlertDialogDescription className="pt-2 text-xs leading-relaxed text-muted-foreground">
            {isSigned ? (
              <span className="block space-y-2">
                <span className="block rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive font-medium">
                  ⚠️ Critical Warning: This agreement is electronically <strong>SIGNED & LOCKED</strong>. Deleting it will permanently erase the contract, SHA-256 cryptographic audit record, and all preserved version snapshots.
                </span>
                <span className="block">
                  To confirm permanent deletion, please type the agreement reference{" "}
                  <strong className="font-mono text-foreground font-bold select-all">{agreement.agreementNumber}</strong> below:
                </span>
              </span>
            ) : (
              <span>
                Are you sure you want to delete this agreement draft for <strong>{agreement.project.name}</strong> ({agreement.client.name})? This action cannot be undone.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isSigned && (
          <div className="space-y-1.5 py-1">
            <Label className="text-xs">Confirmation Reference</Label>
            <Input
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder={`Type "${agreement.agreementNumber}" to confirm`}
              className="font-mono text-xs"
              autoFocus
            />
          </div>
        )}

        <AlertDialogFooter className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleConfirm}
            disabled={!isValid || pending}
            className="gap-1.5"
          >
            {pending ? <Spinner /> : <Trash2 className="h-4 w-4" />}
            {isSigned ? "Permanently Delete Signed Contract" : "Delete Draft"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

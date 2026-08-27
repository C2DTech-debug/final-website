import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

export async function downloadAdminAgreementPdf(agreementId: string, agreementNumber: string) {
  const token = useAuthStore.getState().token;
  const toastId = toast.loading("Generating and downloading PDF…");

  try {
    const res = await fetch(`/api/v1/admin/agreements/${agreementId}/pdf`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!res.ok) {
      const json = await res.json().catch(() => null);
      throw new Error(json?.message || json?.error?.message || `HTTP ${res.status}: Failed to download PDF`);
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Agreement-${agreementNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    toast.success("PDF downloaded successfully", { id: toastId });
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "Failed to download PDF", { id: toastId });
  }
}

export async function downloadPublicAgreementPdf(publicToken: string, agreementNumber: string) {
  const toastId = toast.loading("Downloading signed PDF…");

  try {
    const res = await fetch(`/api/v1/public/agreements/${publicToken}/pdf`);

    if (!res.ok) {
      const json = await res.json().catch(() => null);
      throw new Error(json?.message || json?.error?.message || `HTTP ${res.status}: Failed to download PDF`);
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Agreement-${agreementNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    toast.success("PDF downloaded successfully", { id: toastId });
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "Failed to download PDF", { id: toastId });
  }
}

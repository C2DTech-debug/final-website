"use client";

import * as React from "react";
import Image from "next/image";
import { Copy, ImagePlus, Trash2 } from "lucide-react";
import { useDeleteMedia, useMedia, useUploadMedia } from "@/hooks/useAdmin";
import { PageHeader } from "@/components/admin/page-header";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/utils";
import type { MediaAsset } from "@/types";
import { toast } from "sonner";

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${units[i]}`;
}

export default function AdminMediaPage() {
  const { data, isLoading } = useMedia();
  const upload = useUploadMedia();
  const del = useDeleteMedia();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [deleting, setDeleting] = React.useState<MediaAsset | null>(null);

  const assets = data ?? [];

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      try {
        await upload.mutateAsync(file);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : `Upload failed for ${file.name}`);
      }
    }
    if (inputRef.current) inputRef.current.value = "";
    toast.success("Upload complete");
  };

  const copyUrl = async (asset: MediaAsset) => {
    try {
      await navigator.clipboard.writeText(asset.url);
      toast.success("URL copied");
    } catch {
      toast.error("Could not copy URL");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await del.mutateAsync(deleting._id);
      toast.success("Deleted");
      setDeleting(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Media Library"
        description="Upload and manage images used across the site."
        actions={
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <Button size="sm" onClick={() => inputRef.current?.click()} disabled={upload.isPending}>
              <ImagePlus className="h-4 w-4" /> {upload.isPending ? "Uploading…" : "Upload"}
            </Button>
          </>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <EmptyState
          icon={ImagePlus}
          title="No media yet"
          description="Upload images here and reference them in services, portfolio and team entries."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {assets.map((asset) => (
            <div key={asset._id} className="group relative overflow-hidden rounded-xl border">
              <Image
                src={asset.thumbUrl || asset.url}
                alt={asset.name}
                width={400}
                height={400}
                className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                unoptimized
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Button type="button" size="sm" variant="secondary" onClick={() => copyUrl(asset)}>
                  <Copy className="h-3.5 w-3.5" /> URL
                </Button>
                <Button type="button" size="sm" variant="destructive" onClick={() => setDeleting(asset)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                {formatBytes(asset.size)}
              </div>
              <div className="border-t px-2 py-1.5 text-xs text-muted-foreground">
                <p className="truncate">{asset.originalName}</p>
                <p>{formatDateTime(asset.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete media?"
        description={deleting ? `This will remove "${deleting.originalName}" from storage.` : undefined}
        pending={del.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}

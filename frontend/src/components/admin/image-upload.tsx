"use client";

import * as React from "react";
import Image from "next/image";
import { ImagePlus, Trash2 } from "lucide-react";
import { useUploadMedia } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
  aspect?: string;
}

export function ImageUpload({ value, onChange, className, aspect = "aspect-video" }: ImageUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const upload = useUploadMedia();

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    try {
      const asset = await upload.mutateAsync(file);
      onChange(asset.url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  };

  return (
    <div className={cn("relative overflow-hidden rounded-xl border bg-muted/40", aspect, className)}>
      {value ? (
        <>
          <Image src={value} alt="Preview" fill className="object-cover" unoptimized />
          <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/60 to-transparent p-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>
              <ImagePlus className="h-4 w-4" /> Replace
            </Button>
            <Button type="button" size="sm" variant="destructive" onClick={() => onChange("")}>
              <Trash2 className="h-4 w-4" /> Remove
            </Button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-full w-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground hover:bg-muted/60"
        >
          {upload.isPending ? <Spinner /> : <ImagePlus className="h-6 w-6" />}
          {upload.isPending ? "Uploading…" : "Upload image"}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

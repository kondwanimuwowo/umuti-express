"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadPrescription } from "@/lib/actions/prescriptions";
import { useToast } from "./Toast";
import { UploadIcon } from "./icons";

export function PrescriptionUpload({ productId }: { productId: number }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  const submit = (file: File) => {
    const fd = new FormData();
    fd.set("productId", String(productId));
    fd.set("file", file);

    startTransition(async () => {
      const res = await uploadPrescription(fd);
      if (res.ok) {
        toast(res.message);
        router.refresh();
      } else {
        toast(res.error, "error");
        setFileName(null);
      }
    });
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            setFileName(f.name);
            submit(f);
          }
        }}
      />
      <button
        type="button"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
        className="w-full rounded-card bg-white px-6 py-14 text-center shadow-card transition-shadow hover:shadow-float disabled:cursor-not-allowed disabled:opacity-70"
      >
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-tint text-green-dark">
          <UploadIcon />
        </span>
        <span className="block text-[15px] font-bold">
          {pending ? `Uploading ${fileName}…` : "Click to upload a photo of your prescription"}
        </span>
        <span className="mt-1.5 block text-[13px] text-ink-50">JPG, PNG, WebP or PDF, up to 8MB</span>
      </button>
    </>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { CheckIcon, ClockIcon, UploadIcon } from "@/components/icons";

type Status = "none" | "uploaded" | "reviewing" | "approved";

export function PrescriptionView({ productId }: { productId: number }) {
  const router = useRouter();
  const { approveRx, addToCart } = useStore();
  const [status, setStatus] = useState<Status>("none");
  const [fileName, setFileName] = useState("prescription-photo.jpg");
  const inputRef = useRef<HTMLInputElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Demo only: the pharmacist review is simulated.
  const upload = (name: string) => {
    if (status !== "none") return;
    setFileName(name);
    setStatus("uploaded");
    timers.current.push(setTimeout(() => setStatus("reviewing"), 1100));
    timers.current.push(
      setTimeout(() => {
        setStatus("approved");
        approveRx(productId);
      }, 3200),
    );
  };

  return (
    <div className="container" style={{ maxWidth: 640, paddingTop: 64, paddingBottom: 96 }}>
      <h1 style={{ fontSize: 28, margin: "0 0 12px 0" }}>Upload your prescription</h1>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--ink-62)", margin: "0 0 32px 0" }}>
        A licensed pharmacist will review your prescription before this item is added to your order.
      </p>

      {status === "none" && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f.name);
            }}
          />
          <button
            className="panel"
            onClick={() => inputRef.current?.click()}
            style={{ border: "none", width: "100%", padding: "56px 24px", textAlign: "center", color: "var(--ink)" }}
          >
            <div className="status-icon" style={{ width: 56, height: 56, borderRadius: 16, background: "var(--green-tint)", color: "var(--green-dark)", margin: "0 auto 20px auto" }}>
              <UploadIcon />
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Click to upload a photo of your prescription</div>
            <div style={{ fontSize: 13, color: "var(--ink-50)" }}>JPG or PNG, up to 10MB</div>
          </button>
        </>
      )}

      {status === "uploaded" && (
        <StatusRow icon={<div className="spinner" />} iconBg="var(--white)" title={`Uploading ${fileName}`} sub="Sending to our pharmacy team" />
      )}

      {status === "reviewing" && (
        <StatusRow
          icon={<ClockIcon />}
          iconBg="var(--amber-tint)"
          iconColor="var(--amber)"
          title="A pharmacist is reviewing your prescription"
          sub="This usually takes a few minutes"
        />
      )}

      {status === "approved" && (
        <>
          <StatusRow
            icon={<CheckIcon size={20} />}
            iconBg="var(--white)"
            iconColor="var(--green-dark)"
            bg="var(--green-tint)"
            title="Prescription approved"
            sub="Chanda M., pharmacist, confirmed your prescription"
          />
          <button
            className="btn btn-primary btn-lg btn-block"
            style={{ marginTop: 24 }}
            onClick={() => {
              addToCart(productId, 1);
              router.push("/cart");
            }}
          >
            Continue to cart
          </button>
        </>
      )}
    </div>
  );
}

function StatusRow({
  icon,
  iconBg,
  iconColor,
  bg = "var(--surface)",
  title,
  sub,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor?: string;
  bg?: string;
  title: string;
  sub: string;
}) {
  return (
    <div style={{ borderRadius: 20, background: bg, padding: 32, display: "flex", alignItems: "center", gap: 16 }} role="status">
      <div className="status-icon" style={{ background: iconBg, color: iconColor, boxShadow: "0 1px 2px rgba(11,40,50,0.1)" }}>
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14.5 }}>{title}</div>
        <div style={{ fontSize: 13, color: "var(--ink-50)" }}>{sub}</div>
      </div>
    </div>
  );
}

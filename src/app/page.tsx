"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES, PRODUCTS } from "@/lib/data";
import { ImageSlot } from "@/components/ImageSlot";
import { ProductCard } from "@/components/ProductCard";
import { CategoryIcon, SearchIcon } from "@/components/icons";

const STEPS = [
  { title: "Find your medicine", text: "Search or browse by category. Upload a photo of your prescription if the item requires one." },
  { title: "A pharmacist checks your order", text: "Prescription items are reviewed by a licensed pharmacist before your order is prepared." },
  { title: "Delivered or ready for pickup", text: "Choose home delivery, or pick up from a partner pharmacy near you." },
];

export default function HomePage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const search = () => router.push(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : "/shop");

  return (
    <div>
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-inner">
            <h1>Order medicine without leaving home</h1>
            <p>Browse medicines from pharmacies across Lusaka, upload a prescription when needed, and get your order delivered or ready for pickup.</p>
            <form
              className="search"
              onSubmit={(e) => {
                e.preventDefault();
                search();
              }}
            >
              <SearchIcon />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search medicines, e.g. paracetamol" aria-label="Search medicines" />
              <button type="submit" className="btn btn-primary">
                Search
              </button>
            </form>
            <Link href="/pharmacies" className="btn btn-on-dark" style={{ display: "inline-block" }}>
              Find nearby pharmacy
            </Link>
          </div>
        </div>
        <ImageSlot id="hero-photo" placeholder="Photo: pharmacist handing medicine to a customer" className="hero-photo" eager />
      </section>

      <section className="container home-section">
        <h2 className="section-title">Shop by category</h2>
        <div className="categories">
          {CATEGORIES.map((c) => (
            <Link key={c.id} href={`/shop?category=${c.id}`} className="category">
              <CategoryIcon id={c.id} />
              <span>{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container home-section">
        <div className="section-head">
          <h2 className="section-title">Popular medicines</h2>
          <Link href="/shop" className="link-strong">
            View all
          </Link>
        </div>
        <div className="products">
          {PRODUCTS.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="container steps-section">
        <h2 className="section-title">How ordering works</h2>
        <div className="steps">
          {STEPS.map((s, i) => (
            <div key={s.title}>
              <div className="step-num">{i + 1}</div>
              <div className="step-title">{s.title}</div>
              <div className="step-text">{s.text}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="teaser">
        <div className="container grid-2">
          <ImageSlot id="pharmacy-map" placeholder="Map of nearby partner pharmacies" style={{ width: "100%", height: 340, borderRadius: 20 }} />
          <div>
            <h2>Pick up from a pharmacy near you</h2>
            <p>We work with pharmacies across Lusaka. Search by area to see opening hours, distance and stock.</p>
            <Link href="/pharmacies" className="btn btn-primary btn-lg" style={{ display: "inline-block" }}>
              Find a pharmacy
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

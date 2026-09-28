"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { DELIVERY_FEE, ORDERS_SEED, PHARMACIES, findProduct, type Order, type OrderItem } from "./data";

export type DeliveryMethod = "delivery" | "pickup";
export type PaymentMethod = "mtn" | "airtel";
export type ChatMessage = { from: "pharmacist" | "user"; text: string };

type Persisted = {
  cart: OrderItem[];
  orders: Order[];
  approvedRx: number[];
  selectedPharmacyId: string;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  phoneNumber: string;
  address: string;
  trackingStage: number;
  chatMessages: ChatMessage[];
};

const INITIAL: Persisted = {
  cart: [],
  orders: ORDERS_SEED,
  approvedRx: [],
  selectedPharmacyId: "p1",
  // Delivery is the preferred option and the default at checkout.
  deliveryMethod: "delivery",
  paymentMethod: "mtn",
  phoneNumber: "",
  address: "",
  trackingStage: 1,
  chatMessages: [{ from: "pharmacist", text: "Hello, I'm Chanda, one of our pharmacists. How can I help you today?" }],
};

const STORAGE_KEY = "umuti-express:v1";

type Store = Persisted & {
  toast: string | null;
  cartCount: number;
  subtotal: number;
  deliveryFee: number;
  showToast: (msg: string) => void;
  addToCart: (id: number, qty: number) => void;
  changeCartQty: (id: number, delta: number) => void;
  removeFromCart: (id: number) => void;
  approveRx: (id: number) => void;
  selectPharmacy: (id: string) => void;
  set: (patch: Partial<Pick<Persisted, "deliveryMethod" | "paymentMethod" | "phoneNumber" | "address">>) => void;
  placeOrder: () => Order;
  reorder: (order: Order) => void;
  advanceTracking: () => void;
  sendChat: (text: string) => void;
};

const StoreContext = createContext<Store | null>(null);

function pharmacistReply(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes("malaria")) return "For an adult with confirmed malaria, Coartem is usually taken as a 6-dose course over 3 days, with food. I can flag your order for review if needed.";
  if (lower.includes("prescription")) return "You can upload a photo of your prescription from the product page. I will review it and confirm within a few hours.";
  if (lower.includes("deliver")) return "Home delivery within Lusaka usually arrives same day if ordered before 14:00, otherwise the next morning.";
  return "Thanks for the message. Let me check that for you.";
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(INITIAL);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...INITIAL, ...JSON.parse(raw) });
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state, hydrated]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  }, []);

  const addItems = (cart: OrderItem[], items: OrderItem[]) => {
    const next = cart.map((c) => ({ ...c }));
    for (const it of items) {
      const existing = next.find((c) => c.id === it.id);
      if (existing) existing.qty += it.qty;
      else next.push({ id: it.id, qty: it.qty });
    }
    return next;
  };

  const addToCart = useCallback(
    (id: number, qty: number) => {
      setState((s) => ({ ...s, cart: addItems(s.cart, [{ id, qty }]) }));
      showToast("Added to cart");
    },
    [showToast],
  );

  const changeCartQty = useCallback((id: number, delta: number) => {
    setState((s) => ({ ...s, cart: s.cart.map((c) => (c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c)) }));
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setState((s) => ({ ...s, cart: s.cart.filter((c) => c.id !== id) }));
  }, []);

  const approveRx = useCallback((id: number) => {
    setState((s) => (s.approvedRx.includes(id) ? s : { ...s, approvedRx: [...s.approvedRx, id] }));
  }, []);

  const selectPharmacy = useCallback(
    (id: string) => {
      setState((s) => ({ ...s, selectedPharmacyId: id }));
      showToast("Pharmacy selected for pickup");
    },
    [showToast],
  );

  const set = useCallback<Store["set"]>((patch) => setState((s) => ({ ...s, ...patch })), []);

  const subtotal = state.cart.reduce((sum, c) => sum + (findProduct(c.id)?.price ?? 0) * c.qty, 0);
  const deliveryFee = state.deliveryMethod === "delivery" ? DELIVERY_FEE : 0;

  const placeOrder = useCallback(() => {
    const pharmacy = PHARMACIES.find((p) => p.id === state.selectedPharmacyId);
    const order: Order = {
      id: "UM-" + Math.floor(10300 + Math.random() * 600),
      date: "Today",
      items: state.cart.map((c) => ({ id: c.id, qty: c.qty })),
      total: subtotal + deliveryFee,
      status: "Preparing",
      kind: state.deliveryMethod,
      method: state.deliveryMethod === "delivery" ? "Home delivery" : "Pickup at " + (pharmacy?.name ?? ""),
    };
    setState((s) => ({ ...s, orders: [order, ...s.orders], cart: [], trackingStage: 0 }));
    return order;
  }, [state.cart, state.deliveryMethod, state.selectedPharmacyId, subtotal, deliveryFee]);

  const reorder = useCallback((order: Order) => {
    setState((s) => ({ ...s, cart: addItems(s.cart, order.items) }));
  }, []);

  const advanceTracking = useCallback(() => {
    setState((s) => ({ ...s, trackingStage: Math.min(s.trackingStage + 1, 3) }));
  }, []);

  const sendChat = useCallback((text: string) => {
    setState((s) => ({ ...s, chatMessages: [...s.chatMessages, { from: "user", text }] }));
    setTimeout(() => {
      setState((s) => ({ ...s, chatMessages: [...s.chatMessages, { from: "pharmacist", text: pharmacistReply(text) }] }));
    }, 900);
  }, []);

  const value = useMemo<Store>(
    () => ({
      ...state,
      toast,
      cartCount: state.cart.reduce((sum, c) => sum + c.qty, 0),
      subtotal,
      deliveryFee,
      showToast,
      addToCart,
      changeCartQty,
      removeFromCart,
      approveRx,
      selectPharmacy,
      set,
      placeOrder,
      reorder,
      advanceTracking,
      sendChat,
    }),
    [state, toast, subtotal, deliveryFee, showToast, addToCart, changeCartQty, removeFromCart, approveRx, selectPharmacy, set, placeOrder, reorder, advanceTracking, sendChat],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

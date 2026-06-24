"use client";

import React, { useEffect, useState, useMemo } from "react";
import { message, Select, Drawer, Tag, Modal } from "antd";
import {
  Clock,
  CheckCircle,
  ChevronRight,
  X,
  MapPin,
  User,
  Hash,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import Image from "next/image";

const { Option } = Select;

// --- LUXURY STATUS MAPPING ---
const STATUS_THEMES: Record<
  string,
  { label: string; color: string; icon: any; bg: string }
> = {
  PROCESSING: {
    label: "Processing",
    color: "#B8973A",
    icon: Clock,
    bg: "bg-gold/5",
  },
  DELIVERED: {
    label: "Delivered",
    color: "#059669",
    icon: CheckCircle,
    bg: "bg-emerald-50",
  },
  CANCELLED: { label: "Voided", color: "#dc2626", icon: X, bg: "bg-red-50" },
};

const OrdersList = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [tempStatus, setTempStatus] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/orders");
      const json = await res.json();

      const data = json.success ? json.data : [];
      setOrders(data);

      if (data.length > 0) {
        const firstDate = new Date(data[0].createdAt).toLocaleDateString(
          "en-US",
          {
            month: "long",
            day: "numeric",
            year: "numeric",
          },
        );
        setExpandedDate(firstDate);
      }
    } catch (e) {
      console.error("Sync Failure");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenOrder = (order: any) => {
    setSelectedOrder(order);
    setTempStatus(order.orderStatus);
  };

  const handleSaveStatus = async () => {
    if (!selectedOrder || !tempStatus) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: tempStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === selectedOrder.id ? { ...o, orderStatus: tempStatus } : o,
          ),
        );
        setSelectedOrder((prev: any) => ({ ...prev, orderStatus: tempStatus }));
        message.success("Archive Entry Updated");
      }
    } catch (e) {
      message.error("Sync Error");
    } finally {
      setIsUpdating(false);
    }
  };

  // --- FILTER LOGIC (Updated to All, Processing, Delivered) ---
  const groupedOrders = useMemo(() => {
    const filtered =
      activeFilter === "ALL"
        ? orders
        : orders.filter((o) => o.orderStatus === activeFilter);

    const groups: Record<string, any[]> = {};
    filtered.forEach((order) => {
      const date = new Date(order.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(order);
    });
    return groups;
  }, [orders, activeFilter]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4 bg-[#F5F2EB]">
        <Loader2 className="text-gold animate-spin" size={32} />
        <p className="text-[10px] font-bold text-gold uppercase tracking-[0.4em] animate-pulse">
          Accessing Orders
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#1A1A18] pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-gold/20 pb-4">
          <div>
            <p className="text-[10px] font-black text-gold uppercase tracking-[0.4em] mb-2">
              Novarease Logistics
            </p>
            <h1 className="font-serif text-5xl md:text-6xl text-ink italic">
              Order{" "}
              <span className="font-sans not-italic font-light">Requests</span>
            </h1>
          </div>

          <div className="flex gap-2 bg-white/50 p-1.5 rounded-full border-2 border-gold/10 backdrop-blur-sm">
            {["ALL", "PROCESSING", "DELIVERED"].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-8 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeFilter === f
                    ? "bg-ink text-cream shadow-lg"
                    : "text-ink/40 hover:text-ink"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </header>

        {/* --- TIMELINE LEDGER --- */}
        <div className="space-y-10">
          {Object.keys(groupedOrders).length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
              <ShoppingBag size={40} className="text-gold/20 mb-4" />
              <p className="font-serif text-2xl text-ink/30 italic">
                No entries found in this ledger
              </p>
            </div>
          ) : (
            Object.keys(groupedOrders).map((date) => (
              <div
                key={date}
                className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700"
              >
                <div className="flex items-center gap-4">
                  <h3 className="font-serif text-2xl text-ink pr-4">{date}</h3>
                  <div className="h-px flex-grow bg-gold/10" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedOrders[date].map((order) => {
                    const theme =
                      STATUS_THEMES[order.orderStatus] ||
                      STATUS_THEMES.PROCESSING;
                    return (
                      <div
                        key={order.id}
                        onClick={() => handleOpenOrder(order)}
                        className="group bg-white p-6 rounded-lg border-2 border-gold/20 shadow-sm hover:shadow-xl hover:shadow-gold/5 transition-all cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className={`p-3 rounded-xl ${theme.bg}`}>
                            <theme.icon
                              size={20}
                              style={{ color: theme.color }}
                            />
                          </div>
                          <span className="text-[9px] font-black text-gold uppercase tracking-[0.2em]">
                            #{order.orderNumber}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-serif text-xl text-ink truncate uppercase tracking-wider">
                            {order.customerName}
                          </h4>
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">
                              {new Date(order.createdAt).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </p>
                            <Tag className="m-0 border-none rounded-full px-3 py-0.5 text-[8px] font-black uppercase bg-gold/10 text-gold">
                              {order.paymentStatus}
                            </Tag>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t-2 border-gold/10 flex justify-between items-center">
                          <span className="font-serif text-lg text-gold">
                            ${order.totalAmount.toFixed(2)}
                          </span>
                          <div className="flex items-center gap-2 text-ink/20 group-hover:text-gold transition-colors">
                            <ChevronRight size={18} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- DOSSIER DRAWER --- */}
      <Drawer
        placement="right"
        width={
          typeof window !== "undefined" && window.innerWidth < 768
            ? "100%"
            : "600px"
        }
        onClose={() => setSelectedOrder(null)}
        open={!!selectedOrder}
        styles={{ body: { padding: 0, backgroundColor: "#F5F2EB" } }}
        closeIcon={null}
      >
        {selectedOrder && (
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-gold/10 bg-white/50 backdrop-blur-md flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gold/10 rounded-full transition-colors"
                >
                  <X size={20} className="text-ink" />
                </button>
                <div>
                  <h2 className="font-serif text-2xl text-ink uppercase tracking-wider">
                    {selectedOrder.customerName}
                  </h2>
                  <p className="text-[9px] font-bold text-gold uppercase tracking-[0.3em]">
                    Ref: {selectedOrder.orderNumber}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-grow p-8 space-y-8 overflow-y-auto">
              {/* Lifecycle Control */}
              {/* Lifecycle Control */}
              <div className="bg-white p-6 rounded-lg border-2 border-gold/20 shadow-sm flex items-center justify-between">
                <Select
                  value={tempStatus}
                  className="w-48 h-12 custom-luxury-select"
                  onChange={setTempStatus}
                  // DISABLE if the actual order status in the database is already DELIVERED
                  disabled={
                    selectedOrder.orderStatus === "DELIVERED" || isUpdating
                  }
                >
                  <Option value="PROCESSING">PROCESSING</Option>
                  <Option value="DELIVERED">DELIVERED</Option>
                </Select>

                {/* Only show the update button if the status is different AND not already delivered */}
                {tempStatus !== selectedOrder.orderStatus &&
                  selectedOrder.orderStatus !== "DELIVERED" && (
                    <button
                      onClick={handleSaveStatus}
                      className="bg-ink text-gold px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gold hover:text-ink transition-all"
                    >
                      Update
                    </button>
                  )}

                {/* Optional: Show a "Completed" badge if locked */}
                {selectedOrder.orderStatus === "DELIVERED" && (
                  <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-bold uppercase tracking-widest">
                    <CheckCircle size={14} /> Order Finalized
                  </div>
                )}
              </div>

              {/* Identity & Destination */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-white rounded-lg border-2 border-gold/20 space-y-4">
                  <User size={16} className="text-gold" />
                  <div>
                    <p className="text-[9px] font-bold text-ink/30 uppercase tracking-widest mb-1">
                      Contact
                    </p>
                    <p className="text-xs font-bold text-ink">
                      {selectedOrder.customerEmail}
                    </p>
                    <p className="text-xs font-bold text-ink mt-1">
                      {selectedOrder.customerPhone}
                    </p>
                  </div>
                </div>
                <div className="p-6 bg-white rounded-lg border-2 border-gold/20 space-y-4">
                  <MapPin size={16} className="text-gold" />
                  <div>
                    <p className="text-[9px] font-bold text-ink/30 uppercase tracking-widest mb-1">
                      Destination
                    </p>
                    <p className="text-xs font-bold text-ink leading-relaxed">
                      {selectedOrder.houseAddress}, {selectedOrder.streetName}
                      <br />
                      {selectedOrder.town}, {selectedOrder.state}{" "}
                      {selectedOrder.zipCode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="p-8 bg-ink rounded-lg text-cream relative overflow-hidden shadow-2xl">
                <p className="text-[10px] font-black text-gold uppercase tracking-[0.4em] mb-8">
                  Selected Instruments
                </p>
                <div className="space-y-6 relative z-10">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="relative w-14 h-14 bg-white/5 border border-white/10 rounded-2xl overflow-hidden shrink-0">
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          className="object-contain p-2"
                        />
                      </div>
                      <div className="flex-grow">
                        <p className="text-[11px] font-bold uppercase tracking-wide leading-tight">
                          {item.productName}
                        </p>
                        <p className="text-[9px] text-cream/40 uppercase mt-1">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-serif italic text-gold">
                        ${item.totalPrice.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-10 pt-8 border-t border-white/5 flex justify-between items-baseline relative z-10">
                  <span className="text-[10px] font-bold text-cream/30 uppercase tracking-[0.3em]">
                    Total Value
                  </span>
                  <span className="text-4xl font-serif italic text-gold">
                    ${selectedOrder.totalAmount.toFixed(2)}
                  </span>
                </div>
                <Hash className="absolute -bottom-10 -right-10 w-40 h-40 text-white/[0.02] rotate-12" />
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* --- STATUS UPDATE MODAL --- */}
      <Modal
        open={isUpdating}
        footer={null}
        closable={false}
        centered
        width={300}
        styles={{
          content: { backgroundColor: "#F5F2EB", borderRadius: "2rem" },
        }}
      >
        <div className="py-8 flex flex-col items-center gap-4">
          <Loader2 className="text-gold animate-spin" size={32} />
          <p className="text-[10px] font-black text-ink uppercase tracking-widest">
            Updating Ledger...
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default OrdersList;

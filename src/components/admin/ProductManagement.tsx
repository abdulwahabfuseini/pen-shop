"use client";

import React, { useState, useEffect } from "react";
import CreatePenForm from "./CreatePenForm";
import { Loader2, Plus, Eraser, X, Search } from "lucide-react";
import ProductsList from "./ProductsList";
import { Modal } from "antd";

const ProductsManagement = () => {
  const [pens, setPens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPen, setEditingPen] = useState<any>(null);

  const handleEdit = (pen: any) => {
    setEditingPen(pen);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingPen(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPen(null);
  };

  const fetchPens = async () => {
    try {
      const res = await fetch("/api/pens");
      const json = await res.json();
      if (json.success) setPens(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPens();
  }, []);

  return (
    <div className="space-y-3 animate-in fade-in duration-1000">
      <header className="flex flex-col justify-between gap-4 mb-10 md:flex-row md:items-end">
        <div>
          <p className="text-[10px] tracking-[0.3em] font-bold text-gold uppercase mb-2">
            Management Overview
          </p>
          <h1 className="font-serif text-4xl text-ink md:text-5xl lg:text-6xl">
            The Collection
          </h1>
        </div>

        {/* Quick Stats Summary */}
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-[10px] text-ink/40 uppercase tracking-widest font-bold">
              System Status
            </p>
            <p className="text-xs font-bold text-emerald-600 uppercase flex items-center gap-2 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{" "}
              Live
            </p>
          </div>
        </div>
      </header>
      {/* HEADER SECTION */}
      <div className="flex flex-col justify-between gap-6 px-4 py-2.5 bg-white border border-gold/10 shadow-sm lg:flex-row md:items-center rounded-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-14 h-14 bg-ink shadow-xl rounded-xl shrink-0">
            <Eraser className="text-gold" size={24} />
          </div>
          <div>
            <h2 className="font-serif text-3xl tracking-tight text-ink">
              Inventory
            </h2>
            <p className="text-[10px] font-bold text-gold uppercase tracking-[0.25em] mt-1">
              the Novarease collection
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative">
            <Search
              className="absolute -translate-y-1/2 left-4 top-1/2 text-gold/50"
              size={16}
            />
            <input
              placeholder="Search Products..."
              className="w-full sm:w-64 pl-12 pr-6 py-3 bg-cream/40 border-2 border-gold/10 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-gold/20 placeholder:text-gold/30"
            />
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center justify-center gap-3 px-8 py-3.5 text-[11px] font-bold text-cream tracking-[0.15em] uppercase transition-all bg-ink hover:bg-gold rounded-xl active:scale-95 shadow-xl shadow-gold/5"
          >
            <Plus size={16} /> New Entry
          </button>
        </div>
      </div>

      {/* INVENTORY LIST */}
      <section>
        {loading ? (
          <div className="flex flex-col items-center py-32 gap-4">
            <Loader2 className="text-gold animate-spin" size={32} />
            <p className="text-[10px] font-bold text-gold uppercase tracking-[0.4em] animate-pulse">
              Syncing Products
            </p>
          </div>
        ) : (
          <ProductsList pens={pens} onRefresh={fetchPens} onEdit={handleEdit} />
        )}
      </section>

      {/* LUXURY CREATION MODAL */}
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
        closeIcon={
          <X
            size={20}
            className="text-ink/30 hover:text-ink transition-colors"
          />
        }
        width={350}
        styles={{
          mask: {
            backdropFilter: "blur(12px)",
            backgroundColor: "rgba(26, 26, 24, 0.7)", // Ink/60
          },
          content: {
            backgroundColor: "#F5F2EB", // Cream
            padding: "0px", // We'll use internal padding for the header/body
            border: "1px solid rgba(184, 151, 58, 0.15)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            overflow: "hidden",
          },
        }}
      >
        {/* Custom Header (Antd's title prop is limited, so we place it inside the content) */}
        <div className="px-4 py-12 pb-3 border-b border-gold/10 bg-white/50">
          <h3 className="font-serif text-2xl text-ink uppercase tracking-wider">
            Product Entry
          </h3>
          <p className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] mt-1">
            Expansion of the archival collection
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <CreatePenForm
            onSuccess={() => {
              fetchPens();
              handleCloseModal(); // Use the unified close handler
            }}
            onClose={handleCloseModal}
            initialData={editingPen} // This will be null for new entries
            key={editingPen ? editingPen.id : "new-entry"} // FORCING RE-RENDER
          />
        </div>
      </Modal>
    </div>
  );
};

export default ProductsManagement;

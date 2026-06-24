"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Download, Printer, ArrowLeft, Eraser, Globe } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Link from "next/link";

const Receipt = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/orders`)
      .then((res) => res.json())
      .then((json) => {
        const found = json.data.find((o: any) => o.id === orderId);
        setOrder(found);
      });
  }, [orderId]);

  const downloadPDF = async () => {
    if (!receiptRef.current) return;
    const canvas = await html2canvas(receiptRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Novarease-Receipt-${order?.orderNumber}.pdf`);
  };

  if (!order)
    return (
      <div className="p-20 text-center bg-[#F5F2EB] min-h-screen font-serif text-ink italic">
        Accessing Ledger...
      </div>
    );

  return (
    <div className="min-h-screen py-12 px-6 max-w-4xl mx-auto">
      <div className=" flex justify-between items-center mb-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-[10px] font-bold text-ink/40 uppercase tracking-widest hover:text-ink transition-colors"
        >
          <ArrowLeft size={14} /> Close
        </Link>
        <button
          onClick={downloadPDF}
          className="flex items-center gap-3 px-6 py-3 bg-ink text-gold rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gold hover:text-ink transition-all shadow-xl"
        >
          <Download size={16} /> Download PDF
        </button>
      </div>

      {/* THE ACTUAL PRINTABLE RECEIPT */}
      <div
        ref={receiptRef}
        className="bg-white p-10 rounded-lg shadow-xl border-2 border-gold/20 relative overflow-hidden"
      >
        {/* Aesthetic Background Mark */}
        <Eraser className="absolute -top-20 -right-20 w-80 h-80 text-gold/5 rotate-12" />

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-10 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-ink rounded-lg">
                <Eraser className="text-gold" size={24} />
              </div>
              <span className="font-serif text-3xl uppercase tracking-[0.2em] text-ink">
                Novarease
              </span>
            </div>
            <p className="text-[10px] font-bold text-ink/30 uppercase tracking-[0.3em]">
              Precision Order Instrument
            </p>
          </div>
          <div className="text-right">
            <h1 className="font-serif text-5xl text-gold italic mb-2">
              Invoice
            </h1>
            <p className="text-[11px] font-bold text-ink uppercase tracking-widest">
              #{order.orderNumber}
            </p>
            <p className="text-[11px] font-medium text-ink/40 mt-1 uppercase">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Address Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-20 relative z-10 border-t-2 border-gold/20 pt-10">
          <div>
            <p className="text-[10px] font-black text-gold uppercase tracking-[0.3em] mb-4">
              Customer Detail
            </p>
            <h3 className="font-serif text-2xl text-ink mb-2 uppercase">
              {order.customerName}
            </h3>
            <p className="text-sm text-ink/60 font-medium tracking-tight mb-1">
              {order.customerEmail}
            </p>
            <p className="text-sm text-ink/60 font-medium tracking-tight">
              {order.customerPhone}
            </p>
          </div>
          <div className="md:text-right">
            <p className="text-[10px] font-black text-gold uppercase tracking-[0.3em] mb-4">
              Delivery Destination
            </p>
            <p className="text-sm text-ink/60 font-medium leading-relaxed italic">
              {order.houseAddress}, {order.streetName}
              <br />
              {order.town}, {order.state} {order.zipCode}
              <br />
              {order.country}
            </p>
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-10 relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gold/20 text-[10px] font-black text-gold uppercase tracking-[0.3em]">
                <th className="py-4 font-black">Product</th>
                <th className="py-4 px-4 text-center">Qty</th>
                <th className="py-4 text-right">Valuation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/5">
              {order.items?.map((item: any) => (
                <tr key={item.id} className="text-ink">
                  <td className="py-6 font-serif text-xl capitalize italic">
                    {item.productName}
                  </td>
                  <td className="py-6 px-4 text-center font-bold text-sm">
                    {item.quantity}
                  </td>
                  <td className="py-6 text-right font-serif text-lg">
                    ${item.priceAtSale.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total Block */}
        <div className="flex flex-col items-end border-t-2 border-gold/20 pt-8 relative z-10">
          <div className="w-full md:max-w-sm space-y-4">
            <div className="flex justify-between text-[11px] font-bold text-ink/40 uppercase tracking-widest">
              <span>Subtotal</span>
              <span className="text-ink text-lg font-serif italic">
                $ {order.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-[11px] font-bold text-ink/40 uppercase tracking-widest">
              <span>Logistics</span>
              <span className="text-gold">Complimentary</span>
            </div>
            <div className="flex justify-between items-end pt-6 mt-4 border-t border-gold/10">
              <span className="text-[11px] font-black text-ink uppercase tracking-[0.3em]">
                Final Valuation
              </span>
              <span className="text-4xl font-serif text-ink italic">
                $ {order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-32 text-center relative z-10 border-t border-gold/5 pt-12 flex flex-col items-center gap-6">
          <p className="text-[9px] text-ink/30 uppercase tracking-[0.5em] leading-relaxed max-w-sm">
            Every Novarease Product is a testament to precision and clarity.
            Thank you for your archival commitment.
          </p>
          <Globe size={24} className="text-gold/20" strokeWidth={1} />
        </div>
      </div>
    </div>
  );
};

export default Receipt;

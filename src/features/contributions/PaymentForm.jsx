// src/features/contributions/PaymentForm.jsx
import { useState } from "react";

export default function PaymentForm({ defaultAmount = 6000, onSubmit }) {
  const [amount, setAmount] = useState(defaultAmount);
  const [month, setMonth] = useState(new Date().toISOString().slice(0,7));
  const [note, setNote] = useState("");
  const [file, setFile] = useState(null);

  function handleSubmit(e){
    e.preventDefault();
    onSubmit?.({ amount, month, note, file });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-4 space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm text-slate-600">Month</span>
          <input type="month" value={month} onChange={e=>setMonth(e.target.value)} className="mt-1 w-full rounded-lg border-slate-300 focus:border-brand-600 focus:ring-brand-600" required />
        </label>
        <label className="block">
          <span className="text-sm text-slate-600">Amount (RWF)</span>
          <input type="number" value={amount} onChange={e=>setAmount(+e.target.value)} className="mt-1 w-full rounded-lg border-slate-300 focus:border-brand-600 focus:ring-brand-600" min={0} required />
        </label>
      </div>
      <label className="block">
        <span className="text-sm text-slate-600">Note (optional)</span>
        <textarea value={note} onChange={e=>setNote(e.target.value)} rows={3} className="mt-1 w-full rounded-lg border-slate-300 focus:border-brand-600 focus:ring-brand-600" placeholder="e.g., Sent via BK Mobile" />
      </label>
      <label className="block">
        <span className="text-sm text-slate-600">Receipt (image/PDF)</span>
        <input type="file" accept="image/*,application/pdf" onChange={e=>setFile(e.target.files?.[0] || null)} className="mt-1 w-full" />
      </label>
      <div className="flex justify-end">
        <button type="submit" className="px-4 py-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700">Submit</button>
      </div>
    </form>
  );
}
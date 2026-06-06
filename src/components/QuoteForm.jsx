import React, { useState } from 'react';

export default function QuoteForm() {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-dna-cream p-5">
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6">
        <div className="bg-dna-leaf h-1.5 rounded-full" style={{ width: `${(step / 3) * 100}%` }}></div>
      </div>

      <h1 className="font-display font-bold text-2xl text-dna-forest mb-6">Request a Quote</h1>

      {step === 1 && (
        <div className="space-y-4">
          <label className="block">
            <span className="font-body">Full Name</span>
            <input type="text" className="mt-1 block w-full p-2 bg-dna-cream border border-dna-brown rounded" />
          </label>
          <label className="block">
            <span className="font-body">Email</span>
            <input type="email" className="mt-1 block w-full p-2 bg-dna-cream border border-dna-brown rounded" />
          </label>
          <button onClick={() => setStep(2)} className="btn-primary w-full mt-4">Continue</button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <label className="block">
            <span className="font-body">Service Type</span>
            <select className="mt-1 block w-full p-2 bg-dna-cream border border-dna-brown rounded">
              <option>New Installation</option>
              <option>Lawn Maintenance</option>
              <option>Garden Design</option>
            </select>
          </label>
          <label className="block">
            <span className="font-body">Property Size (sq ft)</span>
            <input type="number" className="mt-1 block w-full p-2 bg-dna-cream border border-dna-brown rounded" />
          </label>
          <button onClick={() => setStep(3)} className="btn-primary w-full mt-4">Next</button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-dna-brown rounded-xl p-6 text-center">
            <p className="font-body text-dna-char">📷 Upload a photo of your yard</p>
          </div>
          <button className="btn-primary w-full">Submit Request</button>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import QuoteForm from './components/QuoteForm';
import './index.css';

function App() {
  const currentPage = 'home'; // Change to 'quote' to see the form

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-dna-brown/20 p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <img src="/assets/icon_forest.svg" alt="DNA" className="w-8 h-8" />
          <span className="font-display font-bold text-xl text-dna-forest tracking-tight">DNA LANDSCAPING</span>
        </div>
        <button className="text-dna-forest font-semibold">Menu</button>
      </header>

      <main>
        {currentPage === 'home' ? (
          <section className="p-6">
            <h1 className="font-display font-bold text-3xl text-dna-forest mb-2">Precision. Growth. Natural Beauty.</h1>
            <p className="text-dna-char/80 mb-6">Welcome back. Your landscape is thriving.</p>

            <div className="dna-card mb-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="font-display font-semibold text-lg">Next Service</h2>
                <span className="bg-dna-leaf/20 text-dna-forest text-xs font-bold px-2 py-1 rounded">UPCOMING</span>
              </div>
              <p className="font-body text-dna-char mb-4">Mowing & Lawn Nutrition</p>
              <p className="text-sm text-dna-brown font-semibold">Tuesday, June 16th • 9:00 AM</p>
            </div>

            <button className="btn-primary w-full">Request a New Quote</button>
          </section>
        ) : (
          <QuoteForm />
        )}
      </main>
    </div>
  );
}

export default App;

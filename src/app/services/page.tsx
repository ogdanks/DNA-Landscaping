'use client'

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <span className="text-2xl font-bold text-green-600">🌿 Landscaping App</span>
            <a href="/" className="px-4 py-2 text-green-600 hover:text-green-700 font-medium">
              Home
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Our Services
          </h1>
          <p className="text-xl text-gray-600">
            Professional landscaping solutions for your home or business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-5xl mb-4">🌱</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Lawn Care</h3>
            <p className="text-gray-600 mb-4">
              Weekly and monthly lawn maintenance including mowing, edging, and fertilization.
            </p>
            <p className="text-green-600 font-semibold">$49–$89/month</p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-5xl mb-4">🌳</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Tree & Shrub Care</h3>
            <p className="text-gray-600 mb-4">
              Pruning, trimming, and health care for trees and shrubs.
            </p>
            <p className="text-green-600 font-semibold">$79–$199/service</p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-5xl mb-4">🏞️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3"> landscape Design</h3>
            <p className="text-gray-600 mb-4">
              Custom landscape design and installation for yards of all sizes.
            </p>
            <p className="text-green-600 font-semibold">$500–$5,000+</p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-5xl mb-4">💧</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Irrigation Systems</h3>
            <p className="text-gray-600 mb-4">
              Installation, repair, and maintenance of sprinkler and irrigation systems.
            </p>
            <p className="text-green-600 font-semibold">$199–$2,500+</p>
          </div>
        </div>
      </div>
    </div>
  )
}

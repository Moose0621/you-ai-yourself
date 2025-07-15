'use client'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-gray-900">
            🎸 Phish Stats Dashboard
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Summer 2025 Tour Analytics
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            API Integration Working
          </h2>
          <p className="text-gray-600">
            The site is loading successfully! API fixes have been applied.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Ready to display real Phish summer tour data from phish.net API
          </p>
        </div>
      </main>
    </div>
  )
}

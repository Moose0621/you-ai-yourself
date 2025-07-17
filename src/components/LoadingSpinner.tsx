export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-phish-blue-50 via-phish-purple-50 to-phish-indigo-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-phish-purple-600 mx-auto mb-6"></div>
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-phish-purple-200 p-8 max-w-md">
          <h2 className="text-2xl font-bold text-phish-purple-800 mb-3 flex items-center justify-center">
            🎵 Loading Phish Data
          </h2>
          <p className="text-phish-purple-600 font-medium">Fetching song statistics and tour information...</p>
          <div className="mt-6 w-full bg-phish-purple-100 rounded-full h-3">
            <div className="bg-gradient-to-r from-phish-purple-500 to-phish-blue-500 h-3 rounded-full animate-pulse w-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

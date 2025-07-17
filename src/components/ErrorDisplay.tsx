interface ErrorDisplayProps {
  error: string
  onRetry?: () => void
}

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-phish-red-50 to-phish-orange-100">
      <div className="text-center">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-phish-red-200 p-8 max-w-md">
          <div className="text-phish-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-phish-red-800 mb-3">Oops! Something went wrong</h2>
          <p className="text-phish-red-600 mb-6 font-medium">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-gradient-to-r from-phish-blue-500 to-phish-blue-600 text-white px-8 py-3 rounded-xl hover:from-phish-blue-600 hover:to-phish-blue-700 transition-all font-semibold shadow-lg transform hover:scale-105"
            >
              🔄 Try Again
            </button>
          )}
          <div className="mt-6 text-sm text-phish-purple-600">
            <p className="font-semibold">If the problem persists, try:</p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-left">
              <li>Refreshing the page</li>
              <li>Clearing your browser cache</li>
              <li>Checking your internet connection</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

export type Tab = 'statistics' | 'tours'

interface NavigationProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: 'statistics' as Tab, label: 'Song Statistics', icon: '📊', shortLabel: 'Stats' },
    { id: 'tours' as Tab, label: 'Tours Explorer', icon: '🎪', shortLabel: 'Tours' }
  ]

  return (
    <nav className="bg-white/90 backdrop-blur-sm shadow-xl border-t-4 border-phish-purple-500 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center sm:justify-start space-x-2 sm:space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-3 sm:px-4 border-b-3 font-semibold text-sm sm:text-base transition-all duration-200 transform hover:scale-105 min-w-0 flex-shrink-0
                ${activeTab === tab.id
                  ? 'border-phish-purple-500 text-phish-purple-700 bg-phish-purple-50/50'
                  : 'border-transparent text-gray-600 hover:text-phish-blue-600 hover:border-phish-blue-300 hover:bg-phish-blue-50/30'
                }
              `}
            >
              <span className="text-lg sm:text-xl">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}

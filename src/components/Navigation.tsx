'use client'

export type Tab = 'statistics' | 'tours'

interface NavigationProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: 'statistics' as Tab, label: 'Song Statistics', icon: '📊' },
    { id: 'tours' as Tab, label: 'Tours Explorer', icon: '🎪' }
  ]

  return (
    <nav className="bg-white/90 backdrop-blur-sm shadow-xl border-t-4 border-phish-purple-500">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center space-x-2 py-4 px-4 border-b-3 font-semibold text-base transition-all duration-200 transform hover:scale-105
                ${activeTab === tab.id
                  ? 'border-phish-purple-500 text-phish-purple-700 bg-phish-purple-50/50'
                  : 'border-transparent text-gray-600 hover:text-phish-blue-600 hover:border-phish-blue-300 hover:bg-phish-blue-50/30'
                }
              `}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}

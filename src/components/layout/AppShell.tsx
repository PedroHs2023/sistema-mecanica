import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useTheme } from '../../hooks/useTheme'

export const SIDEBAR_W           = 220
export const SIDEBAR_W_COLLAPSED = 52
export const TOPBAR_H            = 44

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const { theme, toggle } = useTheme()
  const sidebarWidth = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W

  return (
    <div className="min-h-screen bg-t-bg">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      <Topbar
        sidebarWidth={sidebarWidth}
        theme={theme}
        onThemeToggle={toggle}
      />
      <main
        className="min-h-screen transition-all duration-200"
        style={{ paddingLeft: sidebarWidth, paddingTop: TOPBAR_H }}
      >
        <Outlet />
      </main>
    </div>
  )
}

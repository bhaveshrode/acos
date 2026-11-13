/**
 * RootLayout rendering a premium HSL glassmorphic dark-themed layout shell frame.
 */
export class RootLayout {
  public render(contentHtml: string): string {
    return `
      <div class="acos-root-layout" style="font-family: 'Outfit', sans-serif; display: flex; min-height: 100vh; background: #0c0f17; color: #f3f4f6; margin: 0; padding: 0;">
        <!-- Left Sidebar Navigation -->
        <aside class="acos-sidebar" style="width: 260px; background: rgba(18, 22, 33, 0.95); border-right: 1px solid rgba(255, 255, 255, 0.08); display: flex; flex-direction: column;">
          <div class="sidebar-header" style="padding: 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); display: flex; align-items: center; gap: 12px;">
            <div class="logo-orb" style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #a855f7); box-shadow: 0 0 16px rgba(168, 85, 247, 0.4);"></div>
            <span class="app-title" style="font-weight: 700; font-size: 1.15rem; background: linear-gradient(135deg, #ffffff, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">ACOS Platform</span>
          </div>
          <nav class="sidebar-nav" style="flex: 1; padding: 20px 16px; display: flex; flex-direction: column; gap: 8px;">
            <a href="#dashboard" class="nav-item active" style="padding: 12px 16px; border-radius: 8px; color: #fff; text-decoration: none; display: flex; align-items: center; gap: 12px; background: rgba(99, 102, 241, 0.15); border-left: 3px solid #6366f1; transition: all 0.2s;">
              <span>Dashboard</span>
            </a>
            <a href="#invoices" class="nav-item" style="padding: 12px 16px; border-radius: 8px; color: #94a3b8; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: all 0.2s;">
              <span>Invoices</span>
            </a>
            <a href="#payments" class="nav-item" style="padding: 12px 16px; border-radius: 8px; color: #94a3b8; text-decoration: none; display: flex; align-items: center; gap: 12px; transition: all 0.2s;">
              <span>Payments</span>
            </a>
          </nav>
        </aside>

        <!-- Main Workspace Frame -->
        <div class="acos-main-frame" style="flex: 1; display: flex; flex-direction: column; background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.05), transparent 40%), #0c0f17;">
          <header class="acos-header" style="height: 72px; padding: 0 40px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255, 255, 255, 0.08); background: rgba(12, 15, 23, 0.7); backdrop-filter: blur(12px);">
            <div class="search-bar"></div>
            <div class="profile-block" style="display: flex; align-items: center; gap: 16px;">
              <span class="user-name" style="font-weight: 500; font-size: 0.95rem;">Administrator</span>
              <div class="avatar" style="width: 38px; height: 38px; border-radius: 50%; background: #2e354f; border: 1.5px solid rgba(255, 255, 255, 0.1); display: flex; align-items: center; justify-content: center; font-weight: bold; color: #6366f1;">A</div>
            </div>
          </header>
          <main class="acos-content-viewport" style="flex: 1; padding: 40px; overflow-y: auto;">
            ${contentHtml}
          </main>
        </div>
      </div>
    `;
  }
}

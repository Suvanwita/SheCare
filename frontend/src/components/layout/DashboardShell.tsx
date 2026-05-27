"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Dynamic Sidebar Shell */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main viewport area */}
      <div className="flex flex-1 flex-col overflow-hidden min-h-screen">
        {/* Header toolbar */}
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Main page content layout grid */}
        <main className="flex-grow overflow-y-auto px-4 py-6 sm:px-6 md:px-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

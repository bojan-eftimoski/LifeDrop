import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

export default function MainLayout() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border">
        <div className="p-4">
          <h1 className="text-xl font-bold mb-8">LifeDrop Admin</h1>
          <nav className="space-y-2">
            <Link
              to="/"
              className={`block px-4 py-2 rounded-md ${
                isActive("/")
                  ? "bg-emerald-600 text-white"
                  : "hover:bg-emerald-700"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/emergencies"
              className={`block px-4 py-2 rounded-md ${
                isActive("/emergencies")
                  ? "bg-emerald-600 text-white"
                  : "hover:bg-emerald-700"
              }`}
            >
              Emergencies
            </Link>
            <Link
              to="/replay"
              className={`block px-4 py-2 rounded-md ${
                isActive("/replay")
                  ? "bg-emerald-600 text-white"
                  : "hover:bg-emerald-700"
              }`}
            >
              Replay
            </Link>
            <Link
              to="/settings"
              className={`block px-4 py-2 rounded-md ${
                isActive("/settings")
                  ? "bg-emerald-600 text-white"
                  : "hover:bg-emerald-700"
              }`}
            >
              Settings
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

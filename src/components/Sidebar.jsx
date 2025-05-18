import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";

const menuItems = [
  { path: "/", label: "Dashboard", icon: "📊" },
  { path: "/replay", label: "Replay", icon: "🎥" },
  { path: "/emergency", label: "Emergency", icon: "🚨" },
  { path: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">LifeDrop Admin</h1>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                  location.pathname === item.path
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

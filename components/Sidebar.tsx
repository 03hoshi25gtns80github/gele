"use client";
import { useState } from "react";
import Link from "next/link";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`bg-gray-100 fixed left-0 top-0 h-screen transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="p-4">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-4 right-4 bg-gray-200 p-2 rounded hover:bg-gray-300"
        >
          {isCollapsed ? ">" : "<"}
        </button>
        {!isCollapsed && <h1 className="text-2xl font-bold mb-6">gele-ch</h1>}
        <nav>
          <ul className="space-y-4">
            <li>
              <Link
                href="/profile"
                className={`block hover:bg-gray-200 p-2 rounded ${
                  isCollapsed ? "text-center" : ""
                }`}
              >
                {isCollapsed ? "👤" : "プロフィール更新"}
              </Link>
            </li>
            <li>
              <Link
                href="/settings"
                className={`block hover:bg-gray-200 p-2 rounded ${
                  isCollapsed ? "text-center" : ""
                }`}
              >
                {isCollapsed ? "⚙️" : "設定"}
              </Link>
            </li>
            <li>
              <Link
                href="/logout"
                className={`block hover:bg-gray-200 p-2 rounded ${
                  isCollapsed ? "text-center" : ""
                }`}
              >
                {isCollapsed ? "🚪" : "ログアウト"}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;

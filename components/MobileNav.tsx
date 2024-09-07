import React from "react";
import Link from "next/link";
import { FaCalendarAlt, FaUserAlt, FaCog, FaSignOutAlt } from "react-icons/fa";

const MobileNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg md:hidden h-16 z-50">
      <ul className="flex justify-around items-center h-full text-sm">
        <li>
          <Link href="/my-calendar" className="flex flex-col items-center font-bold text-blue-900 hover:text-blue-600 transition duration-300">
            <FaCalendarAlt size={24} />
          </Link>
          <span>マイカレンダー</span>
        </li>
        <li>
          <Link href="/account" className="flex flex-col items-center font-bold text-blue-900 hover:text-blue-600 transition duration-300">
            <FaUserAlt size={24} />
          </Link>
          <span>プロフィール編集</span>
        </li>
        <li>
          <Link href="/settings" className="flex flex-col items-center font-bold text-blue-900 hover:text-blue-600 transition duration-300">
            <FaCog size={24} />
          </Link>
          <span>設定</span>
        </li>
        <li>
          <form action="/auth/signout" method="post" className="inline">
            <button className="flex flex-col items-center font-bold text-blue-900 hover:text-blue-600 transition duration-300" type="submit">
              <FaSignOutAlt size={24} />
            </button>
          </form>
        </li>
        <span>ログアウト</span>
      </ul>
    </nav>
  );
};

export default MobileNav;

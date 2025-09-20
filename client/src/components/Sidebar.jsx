import React from "react";
import { NavLink } from "react-router-dom";
import { useClerk, useUser, Protect } from "@clerk/clerk-react";
import {
  Eraser,
  FileText,
  Hash,
  House,
  Image,
  Scissors,
  SquarePen,
  User,
} from "lucide-react";

const navItems = [
  { to: "/ai", label: "Dashboard", Icon: House },
  { to: "/ai/write-article", label: "Write Article", Icon: SquarePen },
  { to: "/ai/blog-titles", label: "Blog Titles", Icon: Hash },
  { to: "/ai/generate-images", label: "Generate Images", Icon: Image },
  { to: "/ai/remove-background", label: "Remove Background", Icon: Eraser },
  { to: "/ai/remove-object", label: "Remove Object", Icon: Scissors },
  { to: "/ai/review-resume", label: "Review Resume", Icon: FileText },
  { to: "/ai/community", label: "Community", Icon: User },
];

const Sidebar = ({ sidebar, setSidebar }) => {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();

  return (
    <>
      {/* ✅ Overlay only on mobile */}
      {sidebar && (
        <div
          onClick={() => setSidebar(false)}
          className="fixed inset-0 bg-black/40 z-40 sm:hidden"
        ></div>
      )}

      {/* ✅ Sidebar */}
      <div
      className={`fixed top-6 left-0 h-[calc(100%-64px)] w-60 bg-white border-r border-gray-200 
      flex flex-col justify-between items-start z-50 
      transform transition-transform duration-300 ease-in-out
      ${sidebar ? "translate-x-0" : "-translate-x-full"} 
      sm:relative sm:translate-x-0`}
>
        {/* Profile Section */}
        
        <div className="mt-2 mb-6 w-full px-4"> 
          <div
            onClick={openUserProfile}
            className="flex gap-3 items-center cursor-pointer hover:bg-gray-50 px-2 py-2 rounded-lg transition"
          >
            <img
              src={user?.imageUrl}
              alt="user avatar"
              className="w-10 h-10 rounded-full border border-gray-300"
            />
            <div className="flex flex-col items-start">
              <h1 className="text-sm font-medium">{user?.fullName}</h1>
              <p className="text-xs text-gray-500 -ml-1">
                <Protect plan="premium" fallback="Free">Premium</Protect> Plan
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col w-full px-4 gap-2">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/ai"}
              onClick={() => setSidebar(false)}
              className={({ isActive }) =>
                `px-4 py-3 flex items-center gap-3 rounded-lg 
                ${isActive
                  ? "bg-gradient-to-r from-[#3C81F6] to-[#9324EA] text-white"
                  : "text-gray-700 hover:bg-gray-100"}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 ${isActive ? "text-white" : ""}`} />
                  <span className="text-sm font-medium">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Logout */}
        <div className="mb-6 w-full px-4 flex flex-col gap-3">
          <button
            onClick={() => signOut()}
            className="px-4 py-2 text-sm rounded-lg border bg-red-50 hover:bg-red-100 text-red-600 transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

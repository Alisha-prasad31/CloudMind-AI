import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { Menu, X } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { SignIn, useUser } from "@clerk/clerk-react";

const Layout = () => {
  const navigate = useNavigate();
  const [sidebar, setSidebar] = useState(false);
  const { user } = useUser();

  // ✅ If no user, show SignIn page instead of layout
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <SignIn />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* ✅ Fixed Top Navbar */}
      <nav className="fixed top-0 left-0 w-full px-8 h-14 flex items-center justify-between border-b border-gray-200 bg-white shadow-sm z-50">
        <img
          src={assets.logo}
          alt="Logo"
          onClick={() => navigate("/")}
          className="h-8 cursor-pointer"
        />
        {sidebar ? (
          <X
            onClick={() => setSidebar(false)}
            className="w-6 h-6 text-gray-600 sm:hidden cursor-pointer"
          />
        ) : (
          <Menu
            onClick={() => setSidebar(true)}
            className="w-6 h-6 text-gray-600 sm:hidden cursor-pointer"
          />
        )}
      </nav>

      {/* ✅ Main Layout (Sidebar fixed, only content scrolls) */}
      <div className="flex flex-1 w-full pt-14 h-[calc(100vh-3.5rem)]">
        {/* Sidebar takes full height, doesn’t scroll */}
        <Sidebar sidebar={sidebar} setSidebar={setSidebar} />

        {/* Only this part scrolls */}
        <div className="flex-1 bg-[#F4F7FB] overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;

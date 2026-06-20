import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Navbar onOpenSidebar={() => setIsSidebarOpen(true)} />

                <main className="p-4 md:p-6 overflow-y-auto">
                    <Outlet />
                </main>

            </div>
        </div>
    );
}
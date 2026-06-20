import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
    return (
        <div className="flex">
            <Sidebar />

            <div className="flex flex-col flex-1">
                <Header />

                <main className="p-6 bg-gray-100 min-h-screen">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default MainLayout;

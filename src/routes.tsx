
import DashboardPage from "@/page/DashboardPage";
import { createBrowserRouter } from "react-router-dom";


export const router = createBrowserRouter([
    {
        path: "/",
        element: <DashboardPage />,
        children: [
            {
                path: "project/:projectId",
                element: <div>Project Details Page (to be implemented)</div>,
                
            }
        ],
    }
])
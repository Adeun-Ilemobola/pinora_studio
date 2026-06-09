
import DashboardPage from "@/page/DashboardPage";
import Project from "@/page/Project";
import { createBrowserRouter } from "react-router-dom";


export const router = createBrowserRouter([
    {
        path: "/",
        element: <DashboardPage />,
       
    },
    {
        path: "/project/:projectId",
        element: <Project />,
    }
])
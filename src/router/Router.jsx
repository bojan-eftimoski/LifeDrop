import { createBrowserRouter } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Settings from "../pages/Settings";
import Replay from "../pages/Replay";
import NotFound from "../pages/NotFound";
import MainLayout from "../layouts/MainLayout";
import Emergencies from "../pages/Emergencies";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "replay",
        element: <Replay />,
      },
      {
        path: "emergencies",
        element: <Emergencies />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;

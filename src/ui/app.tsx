import { NavLink, Route, Routes, Navigate } from "react-router-dom";
import classNames from "classnames";

import "@ui/styles/main.css";
import Discover from "./pages/animations";
import Compositions from "./pages/compositions";
import PublicAnimation from "./pages/animations/[animationId]";
import {
  FolderArrowDownIcon,
  FolderOpenIcon,
  UserCircleIcon,
} from "@heroicons/react/20/solid";

const Tabs = [
  {
    to: "/discover",
    text: "Discover",
    logo: <FolderArrowDownIcon height={20} width={20} />,
  },
  {
    to: "/compositions",
    text: "Compositions",
    logo: <FolderOpenIcon height={20} width={20} />,
  },
];

function App() {
  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 border-b border-gray-200 bg-white z-10 flex items-center justify-between px-4">
        <nav className="-mb-px flex space-x-8 " aria-label="Tabs">
          {Tabs.map((tab) => (
            <NavLink
              to={tab.to}
              className={({ isActive }) =>
                classNames(
                  "group inline-flex gap-1 items-center border-b-2 py-4 px-1 text-sm font-medium ",
                  {
                    "border-teal-500 text-teal-600": isActive,
                    "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700":
                      !isActive,
                  }
                )
              }
            >
              {tab.logo}
              {tab.text}
            </NavLink>
          ))}
        </nav>

        <div>
          <UserCircleIcon height={24} width={24} />
        </div>
      </div>
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Navigate to="/discover" />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/discover/:id" element={<PublicAnimation />} />
          <Route path="/compositions" element={<Compositions />} />
          <Route path="*" element={<h1>404</h1>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

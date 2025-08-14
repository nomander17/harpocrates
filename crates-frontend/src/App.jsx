// App.jsx
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Secrets from "./pages/Secrets.jsx";
import { Toaster } from 'sonner';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/secrets" element={<Secrets />} />
      </Routes>
      <Toaster richColors position="top-center" />
    </>
  );
}
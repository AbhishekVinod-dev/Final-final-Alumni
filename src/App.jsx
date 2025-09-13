import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Directory from "./pages/Directory";
import Events from "./pages/Events";
import Mentorship from "./pages/Mentorship";
import Fundraising from "./pages/Fundraising";
import Newsletter from "./pages/Newsletter";
import AuthPage from "./pages/Auth";
import Payments from "./pages/Payments";
import Announcements from "./pages/Announcement";
import Chatbot from "./components/Chatbot";

import { AuthProvider } from "./context/AuthContext";
import ForgotPassword from "./pages/sendPasswordResetEmail";

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <main className="container py-6">
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/directory" element={<Directory />} />
          <Route path="/events" element={<Events />} />
          <Route path="/mentorship" element={<Mentorship />} />
          <Route path="/fundraising" element={<Fundraising />} />
          <Route path="/newsletter" element={<Newsletter />} />
          <Route path="/register" element={<Register />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/chatbot" element={<Chatbot />} />
           <Route path="/sendPasswordResetEmail" element={<ForgotPassword />} />

        </Routes>
      </main>
      <Footer />
    </AuthProvider>
  );
}

import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { auth } from "../firebase";
import { signOut } from 'firebase/auth'

export default function Navbar() {
  const { user } = useAuth();
  const role = user?.role; // Assuming user object has a role property

  return (
    <header className="bg-gray-800 p-4 flex justify-between items-center">
      <Link to="/Home" className="font-bold text-white">Alumni Connect</Link>
      <nav className="flex gap-4">
        <NavLink to="/directory" className={({ isActive }) => isActive ? "text-white font-bold" : "text-gray-400"}>Directory</NavLink>
        <NavLink to="/events" className={({ isActive }) => isActive ? "text-white font-bold" : "text-gray-400"}>Events</NavLink>
        <NavLink to="/mentorship" className={({ isActive }) => isActive ? "text-white font-bold" : "text-gray-400"}>Mentorship</NavLink>
        <NavLink to="/fundraising" className={({ isActive }) => isActive ? "text-white font-bold" : "text-gray-400"}>Fundraising</NavLink>
        {/* <NavLink to="/newsletter" className={({ isActive }) => isActive ? "text-white font-bold" : "text-gray-400"}>Newsletter</NavLink> */}
        <NavLink to="/chatbot" className={({ isActive }) => isActive ? "text-white font-bold" : "text-gray-400"}>Chatbot</NavLink>
      </nav>
      <div className="flex gap-4 items-center">
        {user ? (
          <button onClick={() => signOut(auth)} className="text-white">Logout</button>
        ) : (
          <Link to="/" className="text-white">Login</Link>
        )}
        {user && <Link to="/announcements" className="text-white">Announcements</Link>}
        {role === "admin" && <Link to="/admin" className="text-white">Admin</Link>}
      </div>
    </header>
  );
}

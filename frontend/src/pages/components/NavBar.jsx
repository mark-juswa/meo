import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import { Menu, X } from "lucide-react"; 
import { useAuth } from "../../context/AuthContext.jsx";
import axios from "axios"; 

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { auth, setAuth } = useAuth(); 
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
      setAuth(null); 
      navigate("/login");
      console.log("Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-blue-600 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-3">
          <img
            src="/Logo.png"
            alt="MEO Logo"
            className="h-12 w-12 bg-white rounded-full p-0.5"
          />
          <div>
            <p className="text-xs sm:text-sm font-light leading-tight hidden sm:block">
              MUNICIPAL ENGINEERING OFFICE OF SAN VICENTE
            </p>
            <h1 className="text-md sm:text-xl font-medium">
              MEO Online Services
            </h1>
          </div>
        </div>


        <nav className="hidden sm:flex items-center space-x-6">
          <Link to="/#application" className="text-sm font-medium hover:underline"> Apply </Link>
          <a href="/#track" className="text-sm font-medium hover:underline"> Track </a>
          <a href="#" className="text-sm font-medium hover:underline"> FAQ </a>
           {auth?.accessToken && (
            <Link
              to="/me"
              className="text-sm font-medium hover:underline"
            >
              ME
            </Link>
          )}

          {auth?.accessToken ? (
            <button onClick={handleLogout}
              className="bg-white text-blue-600 px-4 py-2 rounded-full font-semibold text-sm hover:bg-blue-100 transition">
              Log out
            </button>
          ) : (
            <>
              <Link to="/login" className="bg-white text-blue-600 px-4 py-2 rounded-full font-semibold text-sm hover:bg-blue-100 transition"> Log in </Link>
              <Link to="/register" className="bg-white text-blue-600 px-4 py-2 rounded-full font-semibold text-sm hover:bg-blue-100 transition"> Register </Link>
            </>
          )}
        </nav>

        {auth?.accessToken && (
          <button className="sm:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}
      </div>

      {/* --- Mobile Nav --- */}
      {isMenuOpen && auth?.accessToken && (
        <nav className="sm:hidden bg-blue-700 flex flex-col space-y-3 px-6 py-4">
          <Link to="/#application" className="text-sm font-medium text-white hover:underline"
            onClick={() => setIsMenuOpen(false)}> 
            Apply
          </Link>
          <Link to="/#track" className="text-sm font-medium text-white hover:underline"
            onClick={() => setIsMenuOpen(false)} >
            Track
          </Link>
          <Link to="/" className="text-sm font-medium text-white hover:underline"
            onClick={() => setIsMenuOpen(false)}>
            FAQ
          </Link>
          <Link to="/me" className="text-sm font-medium text-white hover:underline"
            onClick={() => setIsMenuOpen(false)}>
            Me
          </Link>

          <button
            onClick={handleLogout} className="bg-white text-blue-600 px-4 py-2 rounded-full font-semibold text-sm hover:bg-blue-100 transition">
            Log out
          </button>
        </nav>
      )}
    </header>
  );
};

export default NavBar;

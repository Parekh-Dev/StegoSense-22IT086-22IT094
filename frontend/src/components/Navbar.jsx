"use client"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { API_ENDPOINTS } from "../config/api"
import ConfirmationModal from "./ConfirmationModal"

const Navbar = ({ user }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      // Call logout API to log the activity
      const token = localStorage.getItem("token")
      if (token) {
        console.log('Calling logout API:', API_ENDPOINTS.AUTH.LOGOUT)
        await axios.post(API_ENDPOINTS.AUTH.LOGOUT, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
        console.log('Logout API call successful')
      }
    } catch (err) {
      // Continue with logout even if API call fails
      console.log('Logout API call failed:', err.message, 'but proceeding with logout')
    } finally {
      // Always clear local storage and navigate
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      navigate("/")
    }
  }

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900">StegoSense</span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 font-medium">Welcome, {user.name}</span>
                <Link
                  to="/app"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogoutClick}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to sign in again to access your account."
        confirmText="Logout"
        cancelText="Stay Logged In"
        type="warning"
      />
    </nav>
  )
}

export default Navbar

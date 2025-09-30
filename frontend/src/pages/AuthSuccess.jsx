"use client"

import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

const AuthSuccess = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (token) {
      // Store the token and redirect to app
      localStorage.setItem("token", token)
      
      // Get user info from token (basic decode - in production, verify the token properly)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        // Store complete user info from JWT
        localStorage.setItem("user", JSON.stringify({ 
          id: payload.id, 
          name: payload.name, 
          email: payload.email 
        }))
      } catch (e) {
        console.error('Error parsing token:', e)
      }
      
      navigate("/app")
    } else if (error) {
      // Handle OAuth error
      const errorMessage = error === 'auth_failed' ? 'Authentication failed' : 'Server error'
      navigate(`/login?error=${encodeURIComponent(errorMessage)}`)
    } else {
      // No token or error, redirect to login
      navigate("/login")
    }
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Completing Sign In</h2>
        <p className="text-gray-600">Please wait while we sign you in...</p>
      </div>
    </div>
  )
}

export default AuthSuccess

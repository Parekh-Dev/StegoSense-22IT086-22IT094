"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { API_ENDPOINTS } from "../config/api"
import ConfirmationModal from "../components/ConfirmationModal"

const History = () => {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    action: "ALL",
    page: 1,
    limit: 20,
    startDate: "",
    endDate: ""
  })
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    totalRecords: 0
  })
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem("user") || "{}")

  useEffect(() => {
    if (!token) {
      navigate("/login")
      return
    }
    
    fetchHistory()
    fetchStats()
  }, [token, filters.action, filters.page])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: filters.page,
        limit: filters.limit,
        ...(filters.action !== "ALL" && { action: filters.action }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      })

      const res = await axios.get(`${API_ENDPOINTS.HISTORY.GET}?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setHistory(res.data.history)
      setPagination({
        totalPages: res.data.totalPages,
        currentPage: res.data.currentPage,
        totalRecords: res.data.totalRecords
      })
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to fetch history")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.HISTORY.STATS, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(res.data)
    } catch (err) {
      console.error("Failed to fetch stats:", err)
    }
  }

  const deleteHistoryEntry = async (historyId) => {
    if (!window.confirm("Are you sure you want to delete this history entry?")) return

    try {
      await axios.delete(API_ENDPOINTS.HISTORY.DELETE(historyId), {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      fetchHistory() // Refresh the list
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to delete history entry")
    }
  }

  const clearAllHistory = async () => {
    if (!window.confirm("Are you sure you want to clear ALL history? This action cannot be undone.")) return

    try {
      await axios.delete(API_ENDPOINTS.HISTORY.CLEAR_ALL, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setHistory([])
      fetchStats() // Refresh stats
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to clear history")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/")
  }

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  const getActionIcon = (action) => {
    const icons = {
      LOGIN: "🔐",
      LOGOUT: "🚪",
      SIGNUP: "👤",
      FILE_UPLOAD: "📤",
      ANALYSIS_COMPLETE: "🔍",
      PROFILE_UPDATE: "✏️",
      PASSWORD_CHANGE: "🔑",
      HISTORY_DELETE: "🗑️",
      HISTORY_CLEAR: "🧹"
    }
    return icons[action] || "📝"
  }

  const getActionColor = (action) => {
    const colors = {
      LOGIN: "text-green-600 bg-green-100",
      LOGOUT: "text-orange-600 bg-orange-100",
      SIGNUP: "text-blue-600 bg-blue-100",
      FILE_UPLOAD: "text-purple-600 bg-purple-100",
      ANALYSIS_COMPLETE: "text-indigo-600 bg-indigo-100",
      PROFILE_UPDATE: "text-yellow-600 bg-yellow-100",
      PASSWORD_CHANGE: "text-red-600 bg-red-100",
      HISTORY_DELETE: "text-gray-600 bg-gray-100",
      HISTORY_CLEAR: "text-red-700 bg-red-200"
    }
    return colors[action] || "text-gray-600 bg-gray-100"
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  if (loading && !history.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">StegoSense</h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/app")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Back to Dashboard
              </button>
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={handleLogoutClick}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Activity History</h2>
          <p className="text-gray-600">Track all your account activities and file analysis history</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Activities</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalActivities}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Files Analyzed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.stats.find(s => s._id === 'ANALYSIS_COMPLETE')?.count || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🔍</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Login Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.stats.find(s => s._id === 'LOGIN')?.count || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🔐</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Files Uploaded</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.stats.find(s => s._id === 'FILE_UPLOAD')?.count || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📤</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
                  <select
                    value={filters.action}
                    onChange={(e) => setFilters({...filters, action: e.target.value, page: 1})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ALL">All Activities</option>
                    <option value="LOGIN">Logins</option>
                    <option value="LOGOUT">Logouts</option>
                    <option value="FILE_UPLOAD">File Uploads</option>
                    <option value="ANALYSIS_COMPLETE">Analysis Results</option>
                    <option value="SIGNUP">Sign Ups</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value, page: 1})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({...filters, endDate: e.target.value, page: 1})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setFilters({action: "ALL", page: 1, limit: 20, startDate: "", endDate: ""})}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Clear Filters
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    onClick={clearAllHistory}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Clear All History
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* History List */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Activity Log</h3>
                  <span className="text-sm text-gray-500">
                    {pagination.totalRecords} total activities
                  </span>
                </div>
              </div>

              {error && (
                <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="p-6">
                {history.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl text-gray-400">📝</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No activity found</h3>
                    <p className="text-gray-500">Try adjusting your filters or start using the application.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((entry) => (
                      <div key={entry._id} className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${getActionColor(entry.action)}`}>
                          <span className="text-lg">{getActionIcon(entry.action)}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">{entry.description}</p>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">{formatDate(entry.timestamp)}</span>
                              <button
                                onClick={() => deleteHistoryEntry(entry._id)}
                                className="text-red-500 hover:text-red-700 transition-colors duration-200"
                                title="Delete this entry"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          
                          <div className="mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(entry.action)}`}>
                              {entry.action.replace(/_/g, ' ')}
                            </span>
                          </div>

                          {entry.metadata && (
                            <div className="mt-2 text-xs text-gray-500">
                              {entry.metadata.originalName && (
                                <span className="block">File: {entry.metadata.originalName}</span>
                              )}
                              {entry.metadata.fileSize && (
                                <span className="block">Size: {(entry.metadata.fileSize / 1024).toFixed(2)} KB</span>
                              )}
                              {entry.metadata.analysisResult && (
                                <span className="block">
                                  Result: {entry.metadata.analysisResult.isStego ? 'Steganography Detected' : 'Clean'} 
                                  ({entry.metadata.analysisResult.confidence}% confidence)
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-8">
                    <button
                      onClick={() => setFilters({...filters, page: Math.max(1, filters.page - 1)})}
                      disabled={filters.page === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    <span className="px-4 py-2 text-sm text-gray-700">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    
                    <button
                      onClick={() => setFilters({...filters, page: Math.min(pagination.totalPages, filters.page + 1)})}
                      disabled={filters.page === pagination.totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to sign in again to access your account and history."
        confirmText="Logout"
        cancelText="Stay Logged In"
        type="warning"
      />
    </div>
  )
}

export default History

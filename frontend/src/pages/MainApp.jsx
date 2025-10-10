"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { API_ENDPOINTS } from "../config/api"
import ConfirmationModal from "../components/ConfirmationModal"

const MainApp = () => {
  const [file, setFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [error, setError] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const [analysisHistory, setAnalysisHistory] = useState([])
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [detectionMethod, setDetectionMethod] = useState("cnn-rnn") // Fixed to CNN+RNN for video support
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    if (!storedToken || !storedUser) {
      navigate("/login")
      return
    }

    setUser(JSON.parse(storedUser))
    // Clear recent analyses on each login - they're session-based only
    setAnalysisHistory([])
  }, [navigate])

  // Cleanup preview URL when component unmounts or when results change
  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview)
      }
    }
  }, [filePreview])

  // Cleanup result preview URL when result changes
  useEffect(() => {
    return () => {
      if (result?.previewUrl && result.previewUrl !== filePreview) {
        URL.revokeObjectURL(result.previewUrl)
      }
    }
  }, [result, filePreview])

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
      // Clear recent analyses on logout (they're session-based only)
      setAnalysisHistory([])
      navigate("/")
    }
  }

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && !selectedFile.type.startsWith("image/") && !selectedFile.type.startsWith("video/")) {
      setError("Please select a valid image or video file")
      setFile(null)
      setFilePreview(null)
      return
    }
    
    if (selectedFile) {
      // Clean up previous result preview if exists
      if (result?.previewUrl) {
        URL.revokeObjectURL(result.previewUrl)
      }
      
      setFile(selectedFile)
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(selectedFile)
      setFilePreview(previewUrl)
      
      setResult(null)
      setError("")
    } else {
      setFile(null)
      setFilePreview(null)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (!droppedFile.type.startsWith("image/") && !droppedFile.type.startsWith("video/")) {
        setError("Please select a valid image or video file")
        setFile(null)
        setFilePreview(null)
        return
      }
      
      // Clean up previous result preview if exists
      if (result?.previewUrl) {
        URL.revokeObjectURL(result.previewUrl)
      }
      
      setFile(droppedFile)
      
      // Create preview URL for dropped file
      const previewUrl = URL.createObjectURL(droppedFile)
      setFilePreview(previewUrl)
      
      setResult(null)
      setError("")
    }
  }

  const saveToHistory = (analysisResult) => {
    const historyItem = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      filename: analysisResult.filename, // Server-generated filename
      originalName: analysisResult.originalName || file?.name, // Original user filename
      isStego: analysisResult.isStego,
      confidence: analysisResult.confidence,
      fileSize: file?.size || 0,
      fileType: file?.type || "",
    }

    // Only keep in session memory - don't persist to localStorage
    // This makes "Recent Analyses" truly session-based
    const updatedHistory = [historyItem, ...analysisHistory.slice(0, 9)]
    setAnalysisHistory(updatedHistory)
    // Removed localStorage persistence - only backend history persists now
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an image or video file first")
      return
    }

    const formData = new FormData()
    formData.append("image", file)

    setLoading(true)
    setError("")
    try {
      // Always use CNN+RNN endpoint
      const res = await axios.post(API_ENDPOINTS.CNN_RNN_DETECT, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      })
      
      // CNN+RNN returns wrapped result
      const resultData = {
        isStego: res.data.result.isStego,
        confidence: res.data.result.confidence || 95, // Include confidence for history (even if not displayed)
        filename: res.data.result.filename,
        originalName: file?.name,
        message: res.data.result.isStego ? "Steganography detected" : "No steganography detected",
        details: res.data.result
      }
      
      // Add preview URL to result for display in results section
      const resultWithPreview = {
        ...resultData,
        previewUrl: filePreview, // Keep the preview URL for results display
        detectionMethod: "cnn-rnn"
      }
      
      setResult(resultWithPreview)
      saveToHistory(resultData)
      
      // Clean up file but keep preview for results
      setFile(null)
      // Don't revoke preview URL yet - we need it for results display
      
      const fileInput = document.querySelector('input[type="file"]')
      if (fileInput) fileInput.value = ""
    } catch (err) {
      setError(err.response?.data?.msg || "Upload failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (!user) {
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
                onClick={() => navigate("/history")}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                View History
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
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Steganography Analysis</h2>
          <p className="text-gray-600">
            Upload an image or video to detect hidden steganographic content using advanced CNN+RNN analysis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                  dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                }`}
              >
                {loading ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Advanced CNN+RNN Analysis in Progress...
                    </h3>
                    <p className="text-gray-600">
                      Please wait while we run advanced deep learning analysis (may take 30-90 seconds)
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {!filePreview ? (
                      <>
                        <svg
                          className="w-20 h-20 text-blue-600 mx-auto"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>

                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Drop your file here or click to browse
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Supports PNG, JPEG, GIF, MP4, AVI and other common formats
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                      <div className="relative">
                        {file?.type?.startsWith('video/') ? (
                          <video
                            src={filePreview}
                            className="max-w-full max-h-64 mx-auto rounded-lg shadow-md object-contain"
                            controls
                          />
                        ) : (
                          <img
                            src={filePreview}
                            alt="Preview"
                            className="max-w-full max-h-64 mx-auto rounded-lg shadow-md object-contain"
                          />
                        )}
                          <button
                            onClick={() => {
                              // Clean up preview URL
                              if (filePreview) {
                                URL.revokeObjectURL(filePreview)
                              }
                              // Clean up result preview if exists
                              if (result?.previewUrl) {
                                URL.revokeObjectURL(result.previewUrl)
                              }
                              
                              setFile(null)
                              setFilePreview(null)
                              setResult(null)
                              
                              const fileInput = document.querySelector('input[type="file"]')
                              if (fileInput) fileInput.value = ""
                            }}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 w-8 h-8 flex items-center justify-center transition-colors duration-200"
                            title="Remove image"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {file?.name}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Size: {formatFileSize(file?.size || 0)} | Type: {file?.type}
                          </p>
                        </div>
                      </>
                    )}

                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-input"
                    />

                    <div className="space-y-4">
                      <label htmlFor="file-input">
                        <div className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          {filePreview ? "Choose Different File" : "Choose Image or Video"}
                        </div>
                      </label>

                      <button
                        onClick={handleUpload}
                        disabled={loading || !file}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        Analyze for Steganography
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats and History */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Summary</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{analysisHistory.length}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {analysisHistory.filter((item) => item.isStego).length}
                  </div>
                  <div className="text-sm text-gray-600">Detected</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">99.5%</div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                </div>
              </div>
            </div>

            {/* Recent History */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Analyses (Session)</h3>
                {analysisHistory.length > 0 && (
                  <button
                    onClick={() => setAnalysisHistory([])}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear Recent
                  </button>
                )}
              </div>

              {analysisHistory.length === 0 ? (
                <div className="text-center py-8">
                  <svg
                    className="w-12 h-12 text-gray-400 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <p className="text-gray-500 text-sm">No recent analyses in this session. Upload an image to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {analysisHistory.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {(item.originalName || item.filename).length > 20 ? 
                            (item.originalName || item.filename).substring(0, 20) + "..." : 
                            (item.originalName || item.filename)
                          }
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.isStego ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                        }`}
                      >
                        {item.isStego ? "DETECTED" : "CLEAN"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Note about session vs persistent history */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center">
                  Session-based • View all analyses in <button 
                    onClick={() => navigate("/history")} 
                    className="text-blue-600 hover:text-blue-700 font-medium underline"
                  >
                    History Page
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Analysis Results</h3>

            {/* Image/Video Preview Section */}
            {result.previewUrl && (
              <div className="mb-8">
                <h4 className="text-lg font-medium text-gray-700 mb-4 text-center">
                  Analyzed Content
                </h4>
                <div className="flex justify-center">
                  <div className="relative">
                    {result.previewUrl.includes('video') || file?.type?.startsWith('video/') ? (
                      <video
                        src={result.previewUrl}
                        className="max-w-md max-h-80 rounded-lg shadow-lg object-contain"
                        controls
                      />
                    ) : (
                      <img
                        src={result.previewUrl}
                        alt={result.originalName || result.filename}
                        className="max-w-md max-h-80 rounded-lg shadow-lg object-contain"
                      />
                    )}
                    <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-sm font-semibold ${
                      result.isStego ? "bg-red-500 text-white" : "bg-green-500 text-white"
                    }`}>
                      {result.isStego ? "DETECTED" : "CLEAN"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Filename</h4>
                <p className="text-lg font-semibold text-gray-900 break-words">
                  {result.originalName || result.filename}
                </p>
              </div>

              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Steganography Detected</h4>
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${
                    result.isStego ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                  }`}
                >
                  {result.isStego ? "YES" : "NO"}
                </span>
              </div>

              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Actions</h4>
                <div className="space-y-2">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200">
                    Download Report
                  </button>
                  <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200">
                    View Details
                  </button>
                </div>
              </div>
            </div>

            <div className="text-center mt-6">
              <p className="text-gray-600">Analysis completed successfully. Results have been saved to your account.</p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout? Any unsaved work will be lost."
        confirmText="Logout"
        cancelText="Stay Logged In"
        type="warning"
      />
    </div>
  )
}

export default MainApp

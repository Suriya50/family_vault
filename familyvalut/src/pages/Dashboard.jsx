import React, { useState, useEffect } from 'react'
import { FiUsers, FiFolder, FiFileText, FiTrendingUp } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { getMembers, getDocuments } from '../services/api'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({ totalMembers: 0, totalDocuments: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [membersRes, docsRes] = await Promise.all([
        getMembers(),
        getDocuments()
      ])
      setStats({
        totalMembers: membersRes.data.data.length,
        totalDocuments: docsRes.data.data.length
      })
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { title: 'Members', value: stats.totalMembers, icon: FiUsers, bg: 'bg-blue-50', color: 'text-blue-600' },
    { title: 'Documents', value: stats.totalDocuments, icon: FiFolder, bg: 'bg-purple-50', color: 'text-purple-600' },
    { title: 'Storage', value: '0 MB', icon: FiFileText, bg: 'bg-green-50', color: 'text-green-600' },
    { title: 'Active', value: 'Yes', icon: FiTrendingUp, bg: 'bg-orange-50', color: 'text-orange-600' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-5 text-white">
        <h1 className="text-lg font-bold">Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋</h1>
        <p className="text-white/80 text-sm mt-1">Here's your vault summary</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((stat, index) => (
          <div key={index} className={`${stat.bg} rounded-xl p-3`}>
            <div className={`${stat.color} mb-2`}>
              <stat.icon size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">{stat.value}</h3>
            <p className="text-xs text-gray-500">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h2>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.href = '/members'}
            className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
          >
            + Add Member
          </button>
          <button
            onClick={() => window.location.href = '/documents'}
            className="flex-1 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100 transition"
          >
            📄 Documents
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
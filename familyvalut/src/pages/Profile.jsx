import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { FiUser, FiMail, FiPhone, FiSave, FiEdit2, FiShield } from 'react-icons/fi'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ 
    name: user?.name || '', 
    email: user?.email || '', 
    phone: user?.phone || '' 
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    toast.success('Profile updated!')
    setIsEditing(false)
  }

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Profile</h1>
        <p className="text-gray-500 text-xs mt-1">Manage your account</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-center">
          <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <h2 className="text-white font-semibold mt-2">{user?.name}</h2>
          <p className="text-white/80 text-xs">{user?.email}</p>
        </div>

        {/* Form */}
        <div className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700 text-sm">Information</h3>
            <button onClick={() => setIsEditing(!isEditing)} className="text-blue-600 text-sm flex items-center gap-1">
              <FiEdit2 size={14} /> {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  disabled={!isEditing}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm disabled:bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={!isEditing}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm disabled:bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  disabled={!isEditing}
                  placeholder="Optional"
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm disabled:bg-gray-50"
                />
              </div>
            </div>

            {isEditing && (
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                <FiSave size={14} /> Save Changes
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-red-100">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-50 rounded-lg">
            <FiShield className="text-red-500" size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-red-600 text-sm">Delete Account</h3>
            <p className="text-xs text-gray-500 mt-1">Permanently delete your account</p>
            <button className="mt-2 px-3 py-1 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
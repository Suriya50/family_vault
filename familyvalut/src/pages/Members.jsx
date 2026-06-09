import React, { useState, useEffect } from 'react'
import { FiUsers, FiPlus, FiEdit2, FiTrash2, FiSearch, FiMail, FiPhone, FiUser, FiX } from 'react-icons/fi'
import { getMembers, createMember, updateMember, deleteMember } from '../services/api'
import toast from 'react-hot-toast'

const Members = () => {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', relationship: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const response = await getMembers()
      setMembers(response.data.data)
    } catch (error) {
      toast.error('Failed to load members')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      if (editingMember) {
        await updateMember(editingMember._id, formData)
        toast.success('Member updated successfully!')
      } else {
        await createMember(formData)
        toast.success('Member added successfully!')
      }
      fetchMembers()
      closeModal()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete ${name}?`)) {
      try {
        await deleteMember(id)
        toast.success('Member deleted!')
        fetchMembers()
      } catch (error) {
        toast.error('Failed to delete')
      }
    }
  }

  const openModal = (member = null) => {
    if (member) {
      setEditingMember(member)
      setFormData({ name: member.name, email: member.email, phone: member.phone || '', relationship: member.relationship })
    } else {
      setEditingMember(null)
      setFormData({ name: '', email: '', phone: '', relationship: '' })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingMember(null)
  }

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRelationColor = (rel) => {
    const colors = { 
      Father: 'bg-blue-100 text-blue-700', 
      Mother: 'bg-pink-100 text-pink-700', 
      Brother: 'bg-purple-100 text-purple-700', 
      Sister: 'bg-orange-100 text-orange-700',
      Spouse: 'bg-green-100 text-green-700',
      Child: 'bg-yellow-100 text-yellow-700'
    }
    return colors[rel] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Family Members</h1>
          <p className="text-gray-500 text-xs mt-1">Manage your family</p>
        </div>
        <button 
          onClick={() => openModal()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-1"
        >
          <FiPlus size={16} /> Add
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        <input 
          type="text" 
          placeholder="Search members..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Members Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1,2,3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-lg animate-pulse"></div>)}
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-10">
          <FiUsers size={40} className="mx-auto text-gray-400 mb-3" />
          <h3 className="text-base font-semibold text-gray-700">No members</h3>
          <p className="text-gray-500 text-sm mt-1">Add your first family member</p>
          <button onClick={() => openModal()} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
            Add Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredMembers.map((member) => (
            <div key={member._id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                  <FiUser size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-sm">{member.name}</h3>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs mt-1 ${getRelationColor(member.relationship)}`}>
                    {member.relationship}
                  </span>
                </div>
              </div>
              
              <div className="mt-3 space-y-1 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <FiMail size={12} /> <span className="truncate">{member.email}</span>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-2">
                    <FiPhone size={12} /> {member.phone}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mt-3 pt-3 border-t">
                <button onClick={() => openModal(member)} className="flex-1 py-1.5 border border-gray-300 rounded-lg text-xs hover:bg-gray-50 flex items-center justify-center gap-1">
                  <FiEdit2 size={12} /> Edit
                </button>
                <button onClick={() => handleDelete(member._id, member.name)} className="flex-1 py-1.5 border border-red-300 text-red-600 rounded-lg text-xs hover:bg-red-50 flex items-center justify-center gap-1">
                  <FiTrash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">{editingMember ? 'Edit Member' : 'Add Member'}</h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded">
                <FiX size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Full Name *"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                required
              />
              <input
                type="email"
                placeholder="Email *"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Phone (Optional)"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Relationship (Father, Mother, etc.) *"
                value={formData.relationship}
                onChange={(e) => setFormData({...formData, relationship: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                required
              />
              
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  {submitting ? 'Saving...' : (editingMember ? 'Update' : 'Add')}
                </button>
                <button type="button" onClick={closeModal} className="flex-1 border border-gray-300 py-2 rounded-lg text-sm hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Members
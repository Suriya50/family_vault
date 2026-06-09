import React, { useState, useEffect } from 'react'
import { 
  FiFolder, FiUpload, FiFileText, FiTrash2, FiSearch, 
  FiImage, FiX, FiEye, FiDownload, FiArrowLeft, FiUser
} from 'react-icons/fi'
import { FaFilePdf, FaFileWord, FaFileExcel } from 'react-icons/fa'
import { getDocuments, uploadDocument, deleteDocument, downloadDocument, getMembers } from '../services/api'
import toast from 'react-hot-toast'

const Documents = () => {
  const [documents, setDocuments] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [uploading, setUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileName, setFileName] = useState('')
  const [selectedMember, setSelectedMember] = useState(null)
  const [previewDoc, setPreviewDoc] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [docsRes, membersRes] = await Promise.all([
        getDocuments(),
        getMembers()
      ])
      setDocuments(docsRes.data.data)
      setMembers(membersRes.data.data)
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('Select a file')
      return
    }

    const formData = new FormData()
    formData.append('document', selectedFile)
    formData.append('name', fileName || selectedFile.name)
    formData.append('familyMember', selectedMember?._id || '')

    setUploading(true)
    try {
      await uploadDocument(formData)
      toast.success(`Uploaded to ${selectedMember?.name || 'General'}!`)
      setShowUploadModal(false)
      setSelectedFile(null)
      setFileName('')
      fetchData()
    } catch (error) {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete "${name}"?`)) {
      try {
        await deleteDocument(id)
        toast.success('Deleted!')
        fetchData()
      } catch (error) {
        toast.error('Delete failed')
      }
    }
  }

  const handlePreview = (doc) => {
    setPreviewDoc(doc)
  }

  const handleDownload = async (doc) => {
    try {
      const response = await downloadDocument(doc._id)
      const url = URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = doc.originalName || doc.name
      link.click()
      URL.revokeObjectURL(url)
      toast.success('Download started!')
    } catch (error) {
      toast.error('Download failed')
    }
  }

  const getFileIcon = (type) => {
    if (type?.includes('pdf')) return <FaFilePdf className="text-red-500" size={28} />
    if (type?.includes('word')) return <FaFileWord className="text-blue-500" size={28} />
    if (type?.includes('excel')) return <FaFileExcel className="text-green-500" size={28} />
    if (type?.includes('image')) return <FiImage className="text-purple-500" size={28} />
    return <FiFileText className="text-gray-500" size={28} />
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getMemberDocs = () => {
    if (!selectedMember) return []
    if (selectedMember._id === null) {
      return documents.filter(d => !d.familyMember)
    }
    return documents.filter(d => d.familyMember?._id === selectedMember._id)
  }

  const memberDocs = getMemberDocs()
  const filteredDocs = memberDocs.filter(d => d.name?.toLowerCase().includes(searchTerm.toLowerCase()))

  // Main view
  if (!selectedMember) {
    const generalCount = documents.filter(d => !d.familyMember).length
    
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Documents</h1>
          <p className="text-gray-500 text-xs mt-1">Tap a folder to view</p>
        </div>

        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-100 rounded-lg animate-pulse"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {/* General Folder */}
            <div
              onClick={() => setSelectedMember({ name: 'General', _id: null })}
              className="bg-white rounded-lg shadow p-3 text-center active:scale-95 transition cursor-pointer"
            >
              <div className="w-12 h-12 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                <FiFolder size={24} className="text-gray-600" />
              </div>
              <h3 className="font-medium text-sm mt-2">General</h3>
              <p className="text-xs text-gray-400">{generalCount} files</p>
            </div>

            {/* Members */}
            {members.map((member) => {
              const count = documents.filter(d => d.familyMember?._id === member._id).length
              return (
                <div
                  key={member._id}
                  onClick={() => setSelectedMember(member)}
                  className="bg-white rounded-lg shadow p-3 text-center active:scale-95 transition cursor-pointer"
                >
                  <div className="w-12 h-12 mx-auto bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    {member.name?.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-medium text-sm mt-2 truncate">{member.name}</h3>
                  <p className="text-xs text-gray-400">{count} files</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Documents view
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button onClick={() => { setSelectedMember(null); setSearchTerm('') }} className="p-2 hover:bg-gray-100 rounded-lg">
            <FiArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-semibold text-gray-800 text-sm">{selectedMember.name}</h1>
            <p className="text-xs text-gray-400">{memberDocs.length} files</p>
          </div>
        </div>
        <button onClick={() => setShowUploadModal(true)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-1">
          <FiUpload size={14} /> Upload
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        <input
          type="text"
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </div>

      {/* Files Grid */}
      {filteredDocs.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg">
          <FiFileText size={40} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">No files yet</p>
          <button onClick={() => setShowUploadModal(true)} className="mt-3 text-blue-600 text-sm">Upload</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {filteredDocs.map((doc) => (
            <div key={doc._id} className="bg-white rounded-lg shadow p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getFileIcon(doc.type)}
                <div>
                  <h3 className="font-medium text-sm text-gray-800 max-w-[150px] truncate">{doc.name}</h3>
                  <p className="text-xs text-gray-400">{formatFileSize(doc.size)}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handlePreview(doc)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Preview">
                  <FiEye size={14} />
                </button>
                <button onClick={() => handleDownload(doc)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Download">
                  <FiDownload size={14} />
                </button>
                <button onClick={() => handleDelete(doc._id, doc.name)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Delete">
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="flex justify-between items-center p-3 border-b">
              <h3 className="font-medium text-sm truncate">{previewDoc.name}</h3>
              <button onClick={() => setPreviewDoc(null)} className="p-1 hover:bg-gray-100 rounded">
                <FiX size={18} />
              </button>
            </div>
            <div className="p-4 flex justify-center">
              {previewDoc.type?.startsWith('image/') ? (
                <img src={`/uploads/${previewDoc.filename}`} alt={previewDoc.name} className="max-w-full rounded" />
              ) : previewDoc.type?.includes('pdf') ? (
                <div className="text-center">
                  <FaFilePdf size={48} className="text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">PDF Document</p>
                  <button onClick={() => handleDownload(previewDoc)} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
                    Download
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  {getFileIcon(previewDoc.type)}
                  <p className="mt-2 text-sm text-gray-600">Preview not available</p>
                  <button onClick={() => handleDownload(previewDoc)} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
                    Download
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Upload to {selectedMember.name}</h2>
              <button onClick={() => { setShowUploadModal(false); setSelectedFile(null); }} className="p-1 hover:bg-gray-100 rounded">
                <FiX size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input type="file" id="file-up" className="hidden" onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) { setSelectedFile(file); setFileName(file.name) }
                }} />
                <label htmlFor="file-up" className="cursor-pointer flex flex-col items-center">
                  <FiUpload size={32} className={selectedFile ? 'text-green-500' : 'text-gray-400'} />
                  <span className="text-sm mt-1">{selectedFile ? selectedFile.name : 'Select file'}</span>
                  <span className="text-xs text-gray-400">PDF, Image, Word, Excel</span>
                </label>
              </div>

              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Document name"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />

              <div className="flex gap-3">
                <button onClick={handleFileUpload} disabled={!selectedFile || uploading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm disabled:opacity-50">
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
                <button onClick={() => { setShowUploadModal(false); setSelectedFile(null); }} className="flex-1 border border-gray-300 py-2 rounded-lg text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Documents
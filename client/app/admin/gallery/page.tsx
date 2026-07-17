'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Image as ImageIcon, Video, Plus, Edit, Trash2, Eye, EyeOff, Upload, X } from 'lucide-react';

interface GalleryItem {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  mediaUrl: string;
  mediaType: 'photo' | 'video';
  category: string;
  thumbnailUrl?: string;
  order: number;
  status: 'Active' | 'InActive';
}

export default function GalleryPage() {
  const { user, admin, loading: authLoading } = useAuth();
  const { confirm } = useConfirm();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [formData, setFormData] = useState<Partial<GalleryItem>>({
    title: '',
    description: '',
    mediaUrl: '',
    mediaType: 'photo',
    category: '',
    thumbnailUrl: '',
    order: 0,
    status: 'Active',
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  useEffect(() => {
    const isAdminUser = user?.userId === 'BIGBULL-000000' || user?.userId === 'CROWN-000000' || user?.userId === 'CNEOX-000000';
    const isAdminAccount = !!admin;

    if (isAdminUser || isAdminAccount) {
      fetchGalleryItems();
      fetchCategories();
    }
  }, [page, selectedCategory, user, admin]);

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      setError('');
      const params: any = { page, limit: 50 };
      if (selectedCategory) params.category = selectedCategory;
      const response = await api.getAllGalleryItemsAdmin(params);
      if (response.data) {
        setItems(response.data.items);
        setTotalPages(response.data.pagination?.pages || 1);
        if (response.data.categories) {
          setCategories(response.data.categories);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch gallery items');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.getGalleryCategories();
      if (response.data?.categories) {
        setCategories(response.data.categories);
      }
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleOpenModal = (item?: GalleryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        description: item.description || '',
        mediaUrl: item.mediaUrl,
        mediaType: item.mediaType,
        category: item.category,
        thumbnailUrl: item.thumbnailUrl || '',
        order: item.order,
        status: item.status,
      });
      setSelectedFile(null);
      setUploadPreview(null);
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        description: '',
        mediaUrl: '',
        mediaType: 'photo',
        category: '',
        thumbnailUrl: '',
        order: 0,
        status: 'Active',
      });
      setSelectedFile(null);
      setUploadPreview(null);
    }
    setShowModal(true);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only allow image files for upload
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('File size must be less than 100MB');
      return;
    }

    setSelectedFile(file);
    
    // Set media type to photo for uploaded images
    setFormData({ ...formData, mediaType: 'photo' });

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // AUTO-UPLOAD: Automatically upload the file when selected
    try {
      setUploading(true);
      setUploadProgress(0);
      setError('');

      // Upload image to Cloudinary
      const response = await api.uploadGalleryMedia(file, 'gallery', 'image');
      
      if (response.data && response.data.url) {
        // Store Cloudinary URL in form data automatically
        setFormData({
          ...formData,
          mediaUrl: response.data.url, // Cloudinary secure URL
          thumbnailUrl: response.data.url, // Use same URL for thumbnail
          mediaType: 'photo', // Ensure it's set to photo
        });
        toast.success('Image uploaded successfully!');
        setUploadProgress(100);
        // Keep preview and file for user to see
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to upload file';
      setError(errorMessage);
      toast.error(errorMessage);
      setSelectedFile(null);
      setUploadPreview(null);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  // Removed handleUpload - now auto-uploads on file select

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadPreview(null);
    setFormData({ ...formData, mediaUrl: '', thumbnailUrl: '' });
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Gallery Item',
      message: 'Are you sure you want to delete this gallery item? This action cannot be undone.',
      variant: 'danger',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
    });

    if (!confirmed) return;

    try {
      setError('');
      setSuccess('');
      await api.deleteGalleryItem(id);
      setSuccess('Gallery item deleted successfully');
      toast.success('Gallery item deleted successfully');
      fetchGalleryItems();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete gallery item';
      setError(errorMessage);
      toast.error(errorMessage);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');

      if (!formData.title || !formData.category) {
        setError('Title and Category are required');
        return;
      }

      // Validate that photos have been uploaded (mediaUrl should be set automatically)
      if (formData.mediaType === 'photo' && !formData.mediaUrl) {
        setError('Please upload an image file');
        return;
      }

      // Validate that videos have URLs
      if (formData.mediaType === 'video' && !formData.mediaUrl) {
        setError('Please provide a video URL');
        return;
      }

      const submitData = {
        title: formData.title,
        description: formData.description || '',
        mediaUrl: formData.mediaUrl || '', // Cloudinary URL for photos, or video URL
        mediaType: formData.mediaType || 'photo',
        category: formData.category,
        thumbnailUrl: formData.thumbnailUrl || formData.mediaUrl || '', // Use mediaUrl as thumbnail if not provided
        order: formData.order || 0,
        status: formData.status || 'Active',
      };

      const itemId = editingItem?._id || editingItem?.id;
      if (itemId) {
        await api.updateGalleryItem(itemId, submitData);
        setSuccess('Gallery item updated successfully');
        toast.success('Gallery item updated successfully');
      } else {
        await api.createGalleryItem(submitData);
        setSuccess('Gallery item created successfully');
        toast.success('Gallery item created successfully');
      }

      setShowModal(false);
      fetchGalleryItems();
      fetchCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save gallery item';
      setError(errorMessage);
      toast.error(errorMessage);
      setTimeout(() => setError(''), 5000);
    }
  };

  const toggleStatus = async (item: GalleryItem) => {
    try {
      const newStatus = item.status === 'Active' ? 'InActive' : 'Active';
      await api.updateGalleryItem(item._id || item.id || '', { status: newStatus });
      toast.success(`Gallery item ${newStatus === 'Active' ? 'activated' : 'deactivated'}`);
      fetchGalleryItems();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-black">Loading gallery items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">Gallery Management</h1>
          <p className="mt-1 text-sm text-black">Manage photos and videos for the website gallery</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Gallery Item
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Category Filter */}
      <div className="mb-4 flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            selectedCategory === ''
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-black hover:bg-gray-300'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-black hover:bg-gray-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-black">Gallery Items</h3>
            <span className="text-sm text-black">
              Page {page} of {totalPages} ({items.length} items)
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Preview
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Order
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-black">
                    No gallery items found. Click "Add Gallery Item" to create one.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id || item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="w-16 h-16 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                        {item.mediaType === 'video' ? (
                          <Video className="w-8 h-8 text-black" />
                        ) : (
                          <img
                            src={item.mediaUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center"><ImageIcon class="w-8 h-8 text-black" /></div>';
                            }}
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-black">{item.title}</div>
                      {item.description && (
                        <div className="text-sm text-black truncate max-w-xs">{item.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.mediaType === 'video' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.mediaType === 'video' ? 'Video' : 'Photo'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-black">
                      {item.order}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleStatus(item)}
                        className={`px-2 py-1 text-xs font-medium rounded-full transition ${
                          item.status === 'Active'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-black hover:bg-gray-200'
                        }`}
                      >
                        {item.status === 'Active' ? (
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <EyeOff className="w-3 h-3" />
                            InActive
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id || item.id || '')}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium text-black bg-white border text-black rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-black">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm font-medium text-black bg-white border text-black rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-black mb-4">
                {editingItem ? 'Edit Gallery Item' : 'Add Gallery Item'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Media Type *
                  </label>
                  <select
                    value={formData.mediaType}
                    onChange={(e) => {
                      const newMediaType = e.target.value as 'photo' | 'video';
                      setFormData({ ...formData, mediaType: newMediaType, mediaUrl: '', thumbnailUrl: '' });
                      setSelectedFile(null);
                      setUploadPreview(null);
                    }}
                    className="w-full px-3 py-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="photo">Photo</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                {/* Photo Upload Section - Simplified, No URL Input */}
                {formData.mediaType === 'photo' && (
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Photo Upload *
                    </label>
                    <div className="flex gap-2 items-start">
                      <label className="flex-1 cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                          disabled={uploading}
                        />
                        <div className={`px-4 py-3 border-2 border-dashed rounded-md transition text-center ${
                          uploading 
                            ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
                            : 'border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer'
                        }`}>
                          <Upload className={`w-6 h-6 mx-auto mb-2 ${uploading ? 'text-gray-400' : 'text-indigo-600'}`} />
                          <span className={`text-sm block ${uploading ? 'text-gray-500' : 'text-black'}`}>
                            {uploading ? 'Uploading...' : 'Choose Image File'}
                          </span>
                          <span className="text-xs text-gray-500 mt-1 block">
                            {uploading ? 'Please wait' : 'Click to select image'}
                          </span>
                        </div>
                      </label>
                      {selectedFile && formData.mediaUrl && !uploading && (
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition"
                          title="Remove image"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    
                    {uploading && (
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Uploading to Cloudinary... {uploadProgress}%</p>
                      </div>
                    )}

                    {selectedFile && uploadPreview && !uploading && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-600 mb-2">
                          ✓ {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB) - Uploaded successfully
                        </p>
                        <div className="border rounded-md overflow-hidden">
                          <img
                            src={uploadPreview}
                            alt="Preview"
                            className="max-w-full h-40 object-contain bg-gray-50"
                          />
                        </div>
                      </div>
                    )}

                    {formData.mediaUrl && !selectedFile && (
                      <div className="mt-3">
                        <p className="text-xs text-green-600 mb-2">✓ Image URL set</p>
                        <div className="border rounded-md overflow-hidden">
                          <img
                            src={formData.mediaUrl}
                            alt="Current"
                            className="max-w-full h-40 object-contain bg-gray-50"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {!formData.mediaUrl && !uploading && (
                      <p className="mt-2 text-xs text-gray-600">
                        Select an image file to upload. It will be automatically uploaded to Cloudinary.
                      </p>
                    )}
                  </div>
                )}

                {/* Video URL Section - Only for Videos */}
                {formData.mediaType === 'video' && (
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Video URL *
                    </label>
                    <input
                      type="url"
                      value={formData.mediaUrl}
                      onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                      className="w-full px-3 py-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="https://youtube.com/watch?v=... or paste video URL"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-600">
                      Paste the video URL (YouTube, Vimeo, or direct video link)
                    </p>
                  </div>
                )}

                {formData.mediaType === 'video' && (
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Thumbnail URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.thumbnailUrl}
                      onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                      className="w-full px-3 py-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="https://example.com/thumbnail.jpg"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Office Video, Solar Plant 1, Solar Plant 2, Events"
                    list="categories"
                    required
                  />
                  <datalist id="categories">
                    {categories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                  <p className="mt-1 text-xs text-black">
                    Type a new category or select from existing ones
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'InActive' })}
                      className="w-full px-3 py-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="InActive">InActive</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {editingItem ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


import { useEffect, useRef, useState } from 'react';
import {
  X,
  UserRound,
  Camera,
  Upload,
  ImagePlus,
  Trash2,
} from 'lucide-react';

import api from '../services/api.js';

export default function ProfileModal({ user, onClose, onSave }) {
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    fullName: user.fullName || '',
    username: user.username || '',
    bio: user.bio || '',
    avatarUrl: user.avatarUrl || '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user.avatarUrl || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setForm({
      fullName: user.fullName || '',
      username: user.username || '',
      bio: user.bio || '',
      avatarUrl: user.avatarUrl || '',
    });

    setSelectedFile(null);
    setPreviewUrl(user.avatarUrl || '');
    setImageFailed(false);
  }, [user]);

  // Clean up temporary image previews
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Please select a JPEG, PNG, or WebP image.');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be 5 MB or smaller.');
      e.target.value = '';
      return;
    }

    setError('');
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setImageFailed(false);
  }

function removePhoto() {
  setSelectedFile(null);
  setPreviewUrl('');

  setForm((previous) => ({
    ...previous,
    avatarUrl: '',
  }));

  setImageFailed(false);
  setError('');

  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
}

  async function handleSubmit(e) {
    e.preventDefault();

    setError('');
    setLoading(true);
    setUploadProgress(0);

    try {
      let avatarUrl = form.avatarUrl;

      // Upload the selected image first
      if (selectedFile) {
        const formData = new FormData();
        formData.append('avatar', selectedFile);

        const { data } = await api.post(
          '/users/me/avatar',
          formData,
          {
            onUploadProgress: (event) => {
              if (event.total) {
                setUploadProgress(
                  Math.round((event.loaded * 100) / event.total)
                );
              }
            },
          }
        );

        avatarUrl = data.user.avatarUrl;
      }

      const updated = {
        fullName: form.fullName.trim(),
        username: form.username.trim(),
        bio: form.bio.trim(),
        avatarUrl: avatarUrl || null,
      };

      await onSave(updated);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Could not update your profile.'
      );
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  }

  const initials = form.fullName
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-md space-y-5 overflow-y-auto rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UserRound size={21} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Your profile
              </h3>
              <p className="text-xs text-slate-500">
                Manage your personal information
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            aria-label="Close profile"
          >
            <X size={20} />
          </button>
        </div>

        {/* Profile photo */}
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-slate-50 py-5">
          <div className="relative">
            {previewUrl && !imageFailed ? (
              <img
                src={previewUrl}
                alt="Profile preview"
                onError={() => setImageFailed(true)}
                className="h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-md"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 text-2xl font-bold text-white shadow-md">
                {initials || <UserRound size={34} />}
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-white bg-blue-600 text-white shadow-md transition hover:bg-blue-700 disabled:opacity-50"
              aria-label="Choose profile photo"
            >
              <Camera size={17} />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 disabled:opacity-50"
            >
              <ImagePlus size={15} />
              Choose photo
            </button>

            {previewUrl && (
              <button
                type="button"
                onClick={removePhoto}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl border border-red-100 bg-white px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 size={14} />
                Remove
              </button>
            )}
          </div>

          <p className="text-xs text-slate-400">
            JPEG, PNG or WebP · Maximum 5 MB
          </p>
        </div>

        {/* Upload progress */}
        {loading && selectedFile && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-slate-500">
              <span>Uploading photo...</span>
              <span>{uploadProgress}%</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Full name */}
        <label className="block text-sm font-semibold text-slate-700">
          Full name

          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            minLength={2}
            maxLength={100}
            required
            disabled={loading}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </label>

        {/* Username */}
        <label className="block text-sm font-semibold text-slate-700">
          Username

          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            minLength={3}
            maxLength={30}
            pattern="[a-zA-Z0-9_]+"
            required
            disabled={loading}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />

          <span className="mt-1 block text-xs font-normal text-slate-400">
            Letters, numbers, and underscores only.
          </span>
        </label>

        {/* Bio */}
        <label className="block text-sm font-semibold text-slate-700">
          Bio

          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            maxLength={160}
            rows={3}
            disabled={loading}
            placeholder="Tell people a little about yourself..."
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />

          <span className="mt-1 block text-right text-xs font-normal text-slate-400">
            {form.bio.length}/160
          </span>
        </label>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-200 py-3 font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-xl bg-blue-600 py-3 font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Upload size={16} className="animate-pulse" />
                Saving...
              </span>
            ) : (
              'Save changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

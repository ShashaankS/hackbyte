'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import Image from 'next/image';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileFormProps = {
  initialData: Partial<Profile>;
  userId: string;
};

export default function ProfileForm({ initialData, userId }: ProfileFormProps) {
  const supabase = createClientComponentClient<Database>();
  const [formData, setFormData] = useState({
    username: initialData.username || '',
    full_name: initialData.full_name || '',
    avatar_url: initialData.avatar_url || '',
    website: initialData.website || '',
    bio: initialData.bio || '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...formData,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      setMessage({ 
        text: 'Profile updated successfully!', 
        type: 'success' 
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        text: 'There was an error updating your profile.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message.text && (
        <div className={`p-4 rounded ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Your unique username"
        />
      </div>

      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          id="full_name"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Your full name"
        />
      </div>

      <div>
        <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700 mb-1">
          Avatar URL
        </label>
        <input
          type="url"
          id="avatar_url"
          name="avatar_url"
          value={formData.avatar_url}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://example.com/your-avatar.jpg"
        />
        {formData.avatar_url && (
          <div className="mt-2">
            <Image 
              src={formData.avatar_url} 
              alt="Avatar preview" 
              className="h-12 w-12 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+URL';
              }}
            />
          </div>
        )}
      </div>

      <div>
        <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
          Website
        </label>
        <input
          type="url"
          id="website"
          name="website"
          value={formData.website}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://yourwebsite.com"
        />
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Tell us a little about yourself"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
}
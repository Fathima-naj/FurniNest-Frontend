
import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosinstance';
import { UserRound, Mail, AtSign } from 'lucide-react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get('/users/me');
        setUser(response.data.user);
      } catch (err) {
        setError(
          err.response?.data?.message || 'Unable to load profile.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      Loading profile...
    </div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">
      {error}
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#F7F3ED] px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-semibold text-[#49372D] mb-2">
          My Profile
        </h1>
        <p className="text-[#8A6652] mb-8">
          View your account information.
        </p>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full bg-[#E5DED6] flex items-center justify-center">
              <UserRound size={42} className="text-[#8A6652]" />
            </div>

            <h2 className="text-xl font-semibold text-[#49372D] mt-4">
              {user.name}
            </h2>
            <p className="text-sm text-[#8A6652]">
              {user.isAdmin ? 'Administrator' : 'Customer'}
            </p>
          </div>

          <div className="space-y-5">
            <div className="flex items-center gap-4 border-b border-[#E5DED6] pb-4">
              <UserRound className="text-[#A45D5D]" />
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium text-[#49372D]">{user.name}</p>
              </div>
            </div>


            <div className="flex items-center gap-4">
              <Mail className="text-[#A45D5D]" />
              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="font-medium text-[#49372D]">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

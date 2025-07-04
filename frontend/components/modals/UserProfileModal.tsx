
import React, { useState, useMemo, useEffect } from 'react';
import { User } from '../../types.ts';
import { apiService } from '../../services/apiService.ts';
import FileUpload from '../common/FileUpload.tsx';

interface UserProfileModalProps {
  user: User;
  onClose: () => void;
  onUserUpdate?: (updatedUser: User) => void;
}

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
);

type EditMode = 'name' | 'username' | 'email' | null;

const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, onClose, onUserUpdate }) => {
  // Profile editing state
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [editedName, setEditedName] = useState(user.name);
  const [editedUsername, setEditedUsername] = useState(user.username);
  const [editedEmail, setEditedEmail] = useState(user.email);
  const [currentAvatar, setCurrentAvatar] = useState(user.avatar);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Password change state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Error and success state
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Reset form when user changes
    setEditedName(user.name);
    setEditedUsername(user.username);
    setEditedEmail(user.email);
    setCurrentAvatar(user.avatar);
  }, [user]);

  const isPasswordFormValid = useMemo(() => {
    return currentPassword && newPassword && newPassword === confirmPassword && newPassword.length >= 6;
  }, [currentPassword, newPassword, confirmPassword]);

  const handleCancelEdit = () => {
    setEditMode(null);
    setEditedName(user.name);
    setEditedUsername(user.username);
    setEditedEmail(user.email);
    setError(null);
  };

  const handleSaveField = async (field: EditMode) => {
    if (!field) return;
    
    setIsUpdating(true);
    setError(null);
    
    try {
      const updateData: any = {};
      
      switch (field) {
        case 'name':
          if (editedName.trim() === user.name) {
            setEditMode(null);
            return;
          }
          updateData.name = editedName.trim();
          break;
        case 'username':
          if (editedUsername.trim() === user.username) {
            setEditMode(null);
            return;
          }
          updateData.username = editedUsername.trim();
          break;
        case 'email':
          if (editedEmail.trim() === user.email) {
            setEditMode(null);
            return;
          }
          updateData.email = editedEmail.trim();
          break;
      }
      
      console.log('📤 Sending profile update:', updateData);
      const response = await apiService.updateUserProfile(updateData);
      console.log('📥 Received profile update response:', response);
      
      if (onUserUpdate) {
        console.log('🔄 Calling onUserUpdate with:', response.user);
        onUserUpdate(response.user);
      } else {
        console.warn('⚠️ onUserUpdate callback not provided');
      }
      
      setSuccessMessage('Profile updated successfully!');
      setEditMode(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarUpload = async (file: File): Promise<string> => {
    try {
      console.log('📷 Uploading profile image:', file.name);
      const response = await apiService.uploadProfileImage(file);
      console.log('📥 Avatar upload response:', response);
      setCurrentAvatar(response.imageUrl);
      
      if (onUserUpdate) {
        console.log('🔄 Calling onUserUpdate with avatar response:', response.user);
        onUserUpdate(response.user);
      } else {
        console.warn('⚠️ onUserUpdate callback not provided for avatar upload');
      }
      
      setSuccessMessage('Profile photo updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      return response.imageUrl;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to upload profile photo');
    }
  };

  const handleCancelPasswordChange = () => {
    setShowChangePassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordFormValid) return;
    
    setIsChangingPassword(true);
    setError(null);
    
    try {
      await apiService.changePassword({
        currentPassword,
        newPassword
      });
      
      setSuccessMessage('Password changed successfully!');
      handleCancelPasswordChange();
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative m-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-center mb-6 text-brand-pink-500">Profile</h3>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Profile Photo Section */}
        <div className="flex flex-col items-center mb-6">
          <FileUpload
            onFileSelect={() => {}} // Not used since we handle upload directly
            onUpload={handleAvatarUpload}
            currentImageUrl={currentAvatar}
            uploadButtonText="Change Photo"
            previewClassName="w-24 h-24 rounded-full object-cover ring-4 ring-brand-pink-200"
            maxSize={5}
          />
          
          {/* Display Name */}
          {editMode === 'name' ? (
            <div className="flex items-center space-x-2 mt-4">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="text-xl font-semibold text-gray-800 bg-brand-pink-50 border border-brand-pink-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-pink-400"
                autoFocus
              />
              <button
                onClick={() => handleSaveField('name')}
                disabled={isUpdating}
                className="text-green-600 hover:text-green-700 disabled:opacity-50"
              >
                <CheckIcon />
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isUpdating}
                className="text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                <XIcon />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 mt-4">
              <h4 className="text-xl font-semibold text-gray-800">{editedName}</h4>
              <button
                onClick={() => setEditMode('name')}
                className="text-gray-500 hover:text-brand-pink-500"
              >
                <EditIcon />
              </button>
            </div>
          )}
        </div>

        {/* Profile Fields */}
        <div className="space-y-4">
          {/* Username */}
          <div>
            <label className="text-sm font-medium text-gray-500">Username</label>
            {editMode === 'username' ? (
              <div className="flex items-center space-x-2 mt-1">
                <input
                  type="text"
                  value={editedUsername}
                  onChange={(e) => setEditedUsername(e.target.value)}
                  className="flex-1 p-2 bg-brand-pink-50 border border-brand-pink-200 rounded focus:outline-none focus:ring-2 focus:ring-brand-pink-400"
                  autoFocus
                />
                <button
                  onClick={() => handleSaveField('username')}
                  disabled={isUpdating}
                  className="text-green-600 hover:text-green-700 disabled:opacity-50"
                >
                  <CheckIcon />
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                  className="text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  <XIcon />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between mt-1">
                <p className="text-gray-700">{editedUsername}</p>
                <button
                  onClick={() => setEditMode('username')}
                  className="text-gray-500 hover:text-brand-pink-500"
                >
                  <EditIcon />
                </button>
              </div>
            )}
          </div>
          
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            {editMode === 'email' ? (
              <div className="flex items-center space-x-2 mt-1">
                <input
                  type="email"
                  value={editedEmail}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  className="flex-1 p-2 bg-brand-pink-50 border border-brand-pink-200 rounded focus:outline-none focus:ring-2 focus:ring-brand-pink-400"
                  autoFocus
                />
                <button
                  onClick={() => handleSaveField('email')}
                  disabled={isUpdating}
                  className="text-green-600 hover:text-green-700 disabled:opacity-50"
                >
                  <CheckIcon />
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                  className="text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  <XIcon />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between mt-1">
                <p className="text-gray-700">{editedEmail}</p>
                <button
                  onClick={() => setEditMode('email')}
                  className="text-gray-500 hover:text-brand-pink-500"
                >
                  <EditIcon />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="my-6 border-t border-brand-pink-200/50"></div>

        {/* Password Change Section */}
        {showChangePassword ? (
          <form onSubmit={handlePasswordSave} className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-700 mb-2">Change Password</h4>
            <div>
              <label className="text-sm font-medium text-brand-pink-600">Current Password</label>
              <input 
                type="password" 
                value={currentPassword} 
                onChange={e => setCurrentPassword(e.target.value)} 
                className="w-full mt-1 p-3 bg-brand-pink-50 border border-brand-pink-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink-400" 
                required 
                disabled={isChangingPassword}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-brand-pink-600">New Password</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                className="w-full mt-1 p-3 bg-brand-pink-50 border border-brand-pink-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink-400" 
                required 
                minLength={6}
                disabled={isChangingPassword}
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>
            <div>
              <label className="text-sm font-medium text-brand-pink-600">Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                className="w-full mt-1 p-3 bg-brand-pink-50 border border-brand-pink-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink-400" 
                required 
                disabled={isChangingPassword}
              />
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button 
                type="button" 
                onClick={handleCancelPasswordChange} 
                disabled={isChangingPassword}
                className="px-4 py-2 text-gray-600 font-semibold rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={!isPasswordFormValid || isChangingPassword} 
                className="px-4 py-2 bg-brand-pink-500 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChangingPassword ? 'Changing...' : 'Save Password'}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <button 
              onClick={() => setShowChangePassword(true)} 
              className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
            >
              Change Password
            </button>
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            disabled={isUpdating || isChangingPassword}
            className="px-8 py-2 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;

import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FaBell,
  FaCalendar,
  FaCamera,
  FaChartBar,
  FaEdit,
  FaEnvelope,
  FaGlobe,
  FaHeart,
  FaInstagram,
  FaLinkedin,
  FaLock,
  FaMapMarkerAlt,
  FaPhone,
  FaSave,
  FaTimes,
  FaTwitter,
  FaUser,
  FaUsers
} from 'react-icons/fa';

// Import des contextes et services
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';

const ProfilePage: React.FC = () => {
  const { user, isLoading, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // États
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security' | 'stats'>('profile');

  // Formulaires
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    location: '',
    bio: '',
    birthDate: '',
    website: '',
    linkedin: '',
    twitter: '',
    instagram: '',
  });

  const [preferencesForm, setPreferencesForm] = useState({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    eventReminders: true,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Initialiser le profil quand l'utilisateur est chargé
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.firstName + ' ' + user.lastName || '',
        location: user.location || '',
        bio: user.bio || '',
        birthDate: user.birthDate || '',
        website: user.socialLinks?.website || '',
        linkedin: user.socialLinks?.linkedin || '',
        twitter: user.socialLinks?.twitter || '',
        instagram: user.socialLinks?.instagram || '',
      });

      setPreferencesForm({
        emailNotifications: user.preferences?.emailNotifications ?? true,
        smsNotifications: user.preferences?.smsNotifications ?? false,
        marketingEmails: user.preferences?.marketingEmails ?? false,
        eventReminders: user.preferences?.eventReminders ?? true,
      });
    }
  }, [user]);

  // Actions
  const handleSaveProfile = async () => {
    if (!profileForm.name.trim()) {
      toast.error('Le nom est requis');
      return;
    }

    setIsUpdating(true);
    try {
      const updatedData = {
        name: profileForm.name,
        phone: profileForm.phone,
        location: profileForm.location,
        bio: profileForm.bio,
        birthDate: profileForm.birthDate,
        socialLinks: {
          website: profileForm.website,
          linkedin: profileForm.linkedin,
          twitter: profileForm.twitter,
          instagram: profileForm.instagram
        },
        preferences: preferencesForm
      };

      await updateProfile(updatedData);
      
      setIsEditing(false);
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('Le fichier est trop volumineux (max 5MB)');
      return;
    }

    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);      await authService.updateAvatar(formData);
      await updateProfile({}); // Refetch user data
      
      toast.success('Photo de profil mise à jour');
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      toast.error('Erreur lors de la mise à jour de la photo de profil');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordModal(false);
      toast.success('Mot de passe modifié avec succès');
    } catch (error) {
      console.error('Erreur lors de la modification du mot de passe:', error);
      toast.error('Erreur lors de la modification du mot de passe');
    }
  };

  const handleTabChange = (tab: 'profile' | 'preferences' | 'security' | 'stats') => {
    setActiveTab(tab);
    if (isEditing) {
      setIsEditing(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = user.stats || {
    eventsCreated: 0,
    eventsAttended: 0,
    totalConnections: 0,
    memberSince: user.createdAt || new Date().toISOString(),
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 dark:bg-gradient-to-br dark:from-blue-950 dark:to-indigo-950 from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 dark:bg-gray-800 ">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={user.photo || '/default-avatar.jpg'}
                alt={user.firstName + ' ' + user.lastName}
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {avatarUploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent"></div>
                ) : (
                  <FaCamera className="w-4 h-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {/* Informations utilisateur */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.firstName + ' ' + user.lastName}</h1>
              <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
              {user.location && (
                <div className="flex items-center justify-center sm:justify-start mt-2 text-gray-500">
                  <FaMapMarkerAlt className="w-4 h-4 mr-1" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.bio && (
                <p className="mt-2 text-gray-700 dark:text-gray-300">{user.bio}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2 dark:bg-green-400 dark:hover:bg-green-500 dark:text-white"
                  >
                    <FaSave className="w-4 h-4" />
                    <span>{isUpdating ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                  >
                    <FaTimes className="w-4 h-4" />
                    <span>Annuler</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <FaEdit className="w-4 h-4" />
                  <span>Modifier</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-lg shadow-sm dark:bg-gray-800">
          {/* Navigation des onglets */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">              {[
                { id: 'profile' as const, label: 'Profil', icon: FaUser },
                { id: 'preferences' as const, label: 'Préférences', icon: FaBell },
                { id: 'security' as const, label: 'Sécurité', icon: FaLock },
                { id: 'stats' as const, label: 'Statistiques', icon: FaChartBar },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleTabChange(id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300 dark:text-gray-400 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Contenu des onglets */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-300">Informations personnelles</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom complet *
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-gray-300">{user.firstName + ' ' + user.lastName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <p className="text-gray-900 flex items-center dark:text-gray-300">
                      <FaEnvelope className="w-4 h-4 mr-2 text-gray-400" />
                      {user.email}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Téléphone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 flex items-center dark:text-gray-300">
                        <FaPhone className="w-4 h-4 mr-2 text-gray-400" />
                        {user.phone || 'Non renseigné'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Localisation
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileForm.location}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 flex items-center dark:text-gray-300">
                        <FaMapMarkerAlt className="w-4 h-4 mr-2 text-gray-400" />
                        {user.location || 'Non renseigné'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date de naissance
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={profileForm.birthDate}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, birthDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 flex items-center dark:text-gray-300">
                        <FaCalendar className="w-4 h-4 mr-2 text-gray-400" />
                        {user.birthDate ? new Date(user.birthDate).toLocaleDateString('fr-FR') : 'Non renseigné'}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Biographie
                  </label>
                  {isEditing ? (
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Parlez-nous de vous..."
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-gray-300">{user.bio || 'Aucune biographie renseignée'}</p>
                  )}
                </div>

                {/* Liens sociaux */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-gray-300 mb-4">Liens sociaux</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'website', label: 'Site web', icon: FaGlobe, placeholder: 'https://monsite.com' },
                      { key: 'linkedin', label: 'LinkedIn', icon: FaLinkedin, placeholder: 'https://linkedin.com/in/profil' },
                      { key: 'twitter', label: 'Twitter', icon: FaTwitter, placeholder: 'https://twitter.com/profil' },
                      { key: 'instagram', label: 'Instagram', icon: FaInstagram, placeholder: 'https://instagram.com/profil' },
                    ].map(({ key, label, icon: Icon, placeholder }) => (
                      <div key={key}>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                          <Icon className="w-4 h-4 mr-2" />
                          {label}
                        </label>
                        {isEditing ? (
                          <input
                            type="url"
                            value={profileForm[key as keyof typeof profileForm]}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, [key]: e.target.value }))}
                            placeholder={placeholder}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900 dark:text-gray-300">
                            {user.socialLinks?.[key as keyof typeof user.socialLinks] || 'Non renseigné'}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Préférences de notification</h2>
                
                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Notifications par email', description: 'Recevoir des notifications par email' },
                    { key: 'smsNotifications', label: 'Notifications SMS', description: 'Recevoir des notifications par SMS' },
                    { key: 'marketingEmails', label: 'Emails marketing', description: 'Recevoir des emails promotionnels' },
                    { key: 'eventReminders', label: 'Rappels d\'événements', description: 'Recevoir des rappels avant les événements' },
                  ].map(({ key, label, description }) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{label}</h3>
                        <p className="text-sm text-gray-600">{description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferencesForm[key as keyof typeof preferencesForm]}
                          onChange={(e) => setPreferencesForm(prev => ({ ...prev, [key]: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={isUpdating}
                  className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isUpdating ? 'Sauvegarde...' : 'Sauvegarder les préférences'}
                </button>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Sécurité</h2>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Mot de passe</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Dernière modification : Il y a 30 jours
                  </p>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Changer le mot de passe
                  </button>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Authentification à deux facteurs</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Activez l'authentification à deux facteurs pour sécuriser votre compte
                  </p>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Activer 2FA
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Statistiques</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg text-center">
                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaCalendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-blue-600">{stats.eventsCreated}</h3>
                    <p className="text-sm text-gray-600">Événements créés</p>
                  </div>

                  <div className="bg-green-50 p-6 rounded-lg text-center">
                    <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaHeart className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-green-600">{stats.eventsAttended}</h3>
                    <p className="text-sm text-gray-600">Événements suivis</p>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-lg text-center">
                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaUsers className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-blue-600">{stats.totalConnections}</h3>
                    <p className="text-sm text-gray-600">Connexions</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Membre depuis</h3>
                  <p className="text-gray-600">
                    {new Date(stats.memberSince).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de changement de mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Changer le mot de passe</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handlePasswordChange}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Changer le mot de passe
              </button>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

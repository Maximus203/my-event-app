import { NotificationDropdown } from '@/components/ui/NotificationDropdown';
import { SearchBar } from '@/components/ui/SearchBar';
import { useAuth } from '@/contexts/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  Home,
  LogOut,
  Menu,
  Plus,
  User,
  X
} from 'lucide-react';
import React, { useState } from 'react';
import { FaSignInAlt } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
    // Navigation based on auth status
  const navigation = [
    { name: 'Accueil', href: '/', icon: Home },
    { name: 'Créer un événement', href: '/events/new', icon: Plus, requiresAuth: true },
    // { name: 'Mes événements', href: '/my-events', icon: User, requiresAuth: true },
    { name: 'Événements', href: '/events', icon: Calendar },
  ];

  const handleSearchSubmit = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setIsSearchOpen(false);
  };

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
    setIsUserMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo et navigation principale */}
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>

              {/* Logo */}
              <Link to="/" className="flex items-center ml-4 md:ml-0">
                <img src="/logo.png" alt="My Event Logo" className='h-16 w-auto' />
              </Link>              {/* Navigation desktop */}
              <nav className="hidden md:ml-8 md:flex md:space-x-8">
                {navigation
                  .filter(item => !item.requiresAuth || isAuthenticated)
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                          isActive
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300 dark:hover:text-white'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {item.name}
                      </Link>
                    );
                  })}
              </nav>
            </div>

            {/* Barre de recherche et actions */}
            <div className="flex items-center space-x-4">
             

              { isAuthenticated ? (
              <>
                <div className="relative">
                  <NotificationDropdown />
                </div>
  
                <div className="relative">
                  <button
                    onClick={handleUserMenuToggle}
                    className="flex items-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >  {user?.photo ? (
                      <img
                        className="h-6 w-6 rounded-full"
                        src={user.photo}
                        alt={user.firstName + " " + user.lastName || 'Utilisateur'}
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </button>
  
                  {/* Dropdown menu utilisateur */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                      >
                        <div className="py-1">
                          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {user?.firstName + " " + user?.lastName || 'Utilisateur'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {user?.email || ''}
                            </p>
                          </div>
                          
                          <Link
                            to="/profile"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                          >
                            <User className="h-4 w-4 mr-2" />
                            Mon profil
                          </Link>
                                                    
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Se déconnecter
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
              ): (<>
                              <div className="flex items-center space-x-3">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => navigate('/login')}
                                >
                                  <FaSignInAlt className="w-4 h-4 mr-2" />
                                  Connexion
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => navigate('/register')}
                                >
                                  Inscription
                                </Button>
                              </div>
              </>)}

            </div>
          </div>
        </div>

        {/* Navigation mobile */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-gray-200 dark:border-gray-700"
            >              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation
                  .filter(item => !item.requiresAuth || isAuthenticated)
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        {item.name}
                      </Link>
                    );
                  })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Modal de recherche mobile */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsSearchOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative bg-white dark:bg-gray-800 px-4 py-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Rechercher
                </h3>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <SearchBar
                onSearch={(query) => {
                  handleSearchSubmit(query);
                  setIsSearchOpen(false);
                }}
                placeholder="Rechercher des événements..."
                autoFocus
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenu principal */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center">
                                <img src="/logo.png" alt="My Event Logo" className='h-16 w-auto' />

              </div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Découvrez et organisez les meilleurs événements près de chez vous.
              </p>
            </div>
            
            <div>
            </div>

          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-gray-600 dark:text-gray-400">
              © 2024 My Event. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

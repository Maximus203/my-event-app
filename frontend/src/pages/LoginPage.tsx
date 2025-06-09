import { Button, Input, ThemeToggle } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useToast } from '@/hooks/useToast';
import type { LoginCredentials } from '@/services/authService';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, LogIn, Mail } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface LoginForm {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const { handleError } = useErrorHandler();
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Redirection après connexion
  const from = ((location.state as { from?: { pathname: string } })?.from?.pathname) || '/events';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Effacer l'erreur lors de la saisie
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.email || !form.password) {
      showToast({
        type: 'warning',
        title: 'Champs requis',
        message: 'Veuillez remplir tous les champs.',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const credentials: LoginCredentials = {
        email: form.email,
        password: form.password,
      };
      
      await login(credentials);
      
      showToast({
        type: 'success',
        title: 'Connexion réussie',
        message: 'Bienvenue sur My Event !',
      });
      
      navigate(from, { replace: true });
    } catch (error) {
      // L'erreur est gérée par le contexte, mais on peut aussi utiliser le toast
      showToast({
        type: 'error',
        title: 'Erreur de connexion',
        message: 'Vérifiez vos identifiants et réessayez.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
     

      {/* Login Form */}
      <div className="flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full space-y-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 transition-colors duration-300">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <LogIn className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Connexion
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Connectez-vous à votre compte My Event
              </p>
            </div>            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Affichage d'erreur */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4"
                >
                  <p className="text-sm text-red-800 dark:text-red-400">
                    {error}
                  </p>
                </motion.div>
              )}

              <Input
                label="Adresse email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                icon={<Mail className="h-5 w-5" />}
                placeholder="votre@email.com"
                fullWidth
                required
              />

              <Input
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleInputChange}
                icon={<Lock className="h-5 w-5" />}
                iconPosition="left"
                placeholder="Votre mot de passe"
                fullWidth
                required
              >
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </Input>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    Se souvenir de moi
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Mot de passe oublié ?
                  </a>
                </div>
              </div>

              <Button
                type="submit"
                loading={isLoading}
                fullWidth
                size="lg"
              >
                Se connecter
              </Button>

              <div className="text-center">
                <span className="text-gray-600 dark:text-gray-300">
                  Pas encore de compte ?{' '}
                </span>
                <Link
                  to="/register"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  S'inscrire
                </Link>
              </div>
            </form>
          </div>

          <div className="text-center">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              ← Retour à l'accueil
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;

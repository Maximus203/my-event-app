import { Button, Input } from '@/components/ui';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useToast } from '@/hooks/useToast';
import { authService } from '@/services/authService';
import type { RegisterData } from '@/types';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, User, UserPlus } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';


const RegisterPage: React.FC = () => {
  const [form, setForm] = useState<RegisterData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const { handleError } = useErrorHandler();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  const handleImageUpload = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setForm(prev => ({ ...prev, photo: imageData }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    if (!form.firstName.trim()) {
      showToast({
        type: 'warning',
        title: 'Prénom requis',
        message: 'Veuillez saisir votre prénom.',
      });
      return false;
    }

    if (!form.lastName.trim()) {
      showToast({
        type: 'warning',
        title: 'Nom requis',
        message: 'Veuillez saisir votre nom.',
      });
      return false;
    }

    if (!form.email.trim()) {
      showToast({
        type: 'warning',
        title: 'Email requis',
        message: 'Veuillez saisir votre adresse email.',
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      showToast({
        type: 'error',
        title: 'Email invalide',
        message: 'Veuillez saisir une adresse email valide.',
      });
      return false;
    }

    if (form.password.length < 6) {
      showToast({
        type: 'error',
        title: 'Mot de passe trop court',
        message: 'Le mot de passe doit contenir au moins 6 caractères.',
      });
      return false;
    }

    if (form.password !== form.confirmPassword) {
      showToast({
        type: 'error',
        title: 'Mots de passe différents',
        message: 'Les mots de passe ne correspondent pas.',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Implémenter l'appel API d'inscription

      await authService.register(form);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulation
      
      showToast({
        type: 'success',
        title: 'Inscription réussie',
        message: 'Votre compte a été créé avec succès !',
      });
      
      navigate('/login');
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">


      {/* Register Form */}
      <div className="flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-lg w-full space-y-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 transition-colors duration-300">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <UserPlus className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Inscription
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Créez votre compte My Event
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Prénom et Nom */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Prénom"
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleInputChange}
                  icon={<User className="h-5 w-5" />}
                  placeholder="Votre prénom"
                  fullWidth
                  required
                />

                <Input
                  label="Nom"
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleInputChange}
                  icon={<User className="h-5 w-5" />}
                  placeholder="Votre nom"
                  fullWidth
                  required
                />
              </div>

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
                placeholder="Au moins 6 caractères"
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

              <Input
                label="Confirmer le mot de passe"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleInputChange}
                icon={<Lock className="h-5 w-5" />}
                iconPosition="left"
                placeholder="Confirmez votre mot de passe"
                fullWidth
                required
              >
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </Input>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  required
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  J'accepte les{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                    conditions d'utilisation
                  </a>{' '}
                  et la{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                    politique de confidentialité
                  </a>
                </label>
              </div>

              <Button
                type="submit"
                loading={isLoading}
                fullWidth
                size="lg"
                variant="primary"
              >
                Créer mon compte
              </Button>

              <div className="text-center">
                <span className="text-gray-600 dark:text-gray-300">
                  Déjà un compte ?{' '}
                </span>
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Se connecter
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

export default RegisterPage;

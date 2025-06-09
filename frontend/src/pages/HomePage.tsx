import { ButtonLink } from '@/components/ui';
import { motion } from 'framer-motion';
import { Bell, CalendarDays, Users } from 'lucide-react';
import React from 'react';

const HomePage: React.FC = () => {

  const features = [
    {
      icon: <CalendarDays className="h-12 w-12 text-blue-600" />,
      title: 'Gestion d\'événements',
      description: 'Créez et gérez vos événements facilement avec notre interface intuitive.'
    },
    {
      icon: <Users className="h-12 w-12 text-green-600" />,
      title: 'Suivi des participants',
      description: 'Suivez les inscriptions et gérez vos participants en temps réel.'
    },
    {
      icon: <Bell className="h-12 w-12 text-yellow-600" />,
      title: 'Notifications automatiques',
      description: 'Envoyez des rappels automatiques par email 24h avant vos événements.'
    }
  ];

  const stats = [
    { number: '10+', label: 'Événements créés' },
    { number: '50+', label: 'Participants actifs' },
    { number: '98%', label: 'Satisfaction client' },
    { number: '24/7', label: 'Support disponible' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-indigo-950 transition-colors duration-300">
     
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Image de fond avec flou */}
        <div className="absolute inset-0 bg-cover bg-center bg-[url('/hero.jpg')] blur-sm" />
        
        {/* Overlay optionnel pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-black/30" />
        
        {/* Contenu sans flou */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
        <h2 className="text-5xl font-extrabold text-white mb-6 transition-colors duration-300">
          Créez et gérez vos événements
          <span className="block text-blue-400">en toute simplicité</span>
        </h2>
        <p className="text-xl text-gray-100 mb-8 max-w-3xl mx-auto transition-colors duration-300">
          My Event est la plateforme idéale pour organiser vos événements,
          gérer les inscriptions et suivre les participants en temps réel.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
          <ButtonLink size="lg" to="/events" icon={<CalendarDays className="h-5 w-5" />}>
            Découvrir les événements
          </ButtonLink>
        </div>
        
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20  transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Pourquoi choisir My Event ?
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Découvrez les fonctionnalités qui font de My Event la solution idéale 
              pour tous vos besoins d'organisation d'événements.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
                className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex justify-center mb-6">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
                  {feature.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-blue-100">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


    </div>
  );
};

export default HomePage;
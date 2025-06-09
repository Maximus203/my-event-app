import { motion } from 'framer-motion';
import React from 'react';
import { FaArrowLeft, FaCalendarAlt, FaHome, FaSearch } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

// Import des composants
import { Button, Card } from '@/components/ui';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  // Suggestions de pages populaires
  const popularPages = [
    {
      title: 'Événements',
      description: 'Découvrez tous les événements disponibles',
      icon: FaCalendarAlt,
      path: '/events',
      color: 'bg-blue-500'
    },
    {
      title: 'Créer un événement',
      description: 'Organisez votre propre événement',
      icon: FaSearch,
      path: '/events/new',
      color: 'bg-green-500'
    },
    {
      title: 'Tableau de bord',
      description: 'Gérez vos événements et inscriptions',
      icon: FaHome,
      path: '/dashboard',
      color: 'bg-blue-500'
    }
  ];

  return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="container mx-auto px-4 py-16 text-center"
      >
        {/* Illustration 404 */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="relative">
            {/* Grand 404 avec effet gradient */}
            <div className="text-[12rem] md:text-[16rem] font-bold bg-gradient-to-r from-primary-500 via-blue-500 to-pink-500 bg-clip-text text-transparent leading-none">
              404
            </div>
            
            {/* Éléments décoratifs flottants */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute top-0 left-1/4 w-16 h-16 bg-blue-500 rounded-full opacity-20"
            />
            <motion.div
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
              className="absolute top-16 right-1/4 w-12 h-12 bg-blue-500 rounded-full opacity-20"
            />
            <motion.div
              animate={{ y: [-5, 15, -5] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
              className="absolute bottom-16 left-1/3 w-8 h-8 bg-pink-500 rounded-full opacity-20"
            />
          </div>
        </motion.div>

        {/* Titre et description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Oups ! Page introuvable
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            La page que vous cherchez semble avoir disparu. Elle a peut-être été déplacée, 
            supprimée ou vous avez saisi une URL incorrecte.
          </p>
        </motion.div>

        {/* Actions principales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <Button
            onClick={() => navigate(-1)}
            variant="secondary"
            size="lg"
            className="min-w-[200px]"
          >
            <FaArrowLeft className="w-5 h-5 mr-2" />
            Retour en arrière
          </Button>
          <Button
            onClick={() => navigate('/')}
            size="lg"
            className="min-w-[200px]"
          >
            <FaHome className="w-5 h-5 mr-2" />
            Retour à l'accueil
          </Button>
        </motion.div>

        {/* Suggestions de pages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-8">
            Ou explorez ces pages populaires :
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {popularPages.map((page, index) => (
              <motion.div
                key={page.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
              >
                <Link to={page.path}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group">
                    <div className="p-6 text-center">
                      <div className={`w-16 h-16 ${page.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <page.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {page.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {page.description}
                      </p>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Section d'aide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-16 max-w-2xl mx-auto"
        >
          <Card className="bg-gray-50 dark:bg-gray-800 border-dashed">
            <div className="p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Besoin d'aide ?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Si vous pensez qu'il s'agit d'une erreur ou si vous ne trouvez pas ce que vous cherchez, 
                n'hésitez pas à nous contacter.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="secondary"
                  onClick={() => navigate('/contact')}
                >
                  Nous contacter
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/faq')}
                >
                  FAQ
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Citation motivante */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-12"
        >
          <blockquote className="text-lg italic text-gray-500 dark:text-gray-400">
            "Parfois, se perdre est le meilleur moyen de découvrir de nouveaux chemins."
          </blockquote>
        </motion.div>

        {/* Animation de particules en arrière-plan */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary-500 rounded-full opacity-10"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, 20],
                x: [-10, 10],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </motion.div>
  );
};

export default NotFoundPage;

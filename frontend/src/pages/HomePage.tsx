import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header/Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">My Event</h1>
            </div>
            <div className="flex space-x-4">
              <Link 
                to="/login" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Connexion
              </Link>
              <Link 
                to="/register" 
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Inscription
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-5xl font-extrabold text-gray-900 mb-6">
              Créez et gérez vos événements
              <span className="block text-blue-600">en toute simplicité</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              My Event est la plateforme idéale pour organiser vos événements, 
              gérer les inscriptions et suivre les participants en temps réel.
            </p>
            <div className="flex justify-center space-x-4">
              <Link 
                to="/events"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300"
              >
                Découvrir les événements
              </Link>
              <Link 
                to="/register"
                className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50 transition duration-300"
              >
                Créer un compte
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Fonctionnalités principales
            </h3>
            <p className="text-lg text-gray-600">
              Tout ce dont vous avez besoin pour organiser des événements réussis
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="text-blue-600 text-4xl mb-4">📅</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Création d'événements
              </h4>
              <p className="text-gray-600">
                Créez facilement vos événements avec tous les détails nécessaires : 
                date, lieu, description et nombre de participants.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="text-blue-600 text-4xl mb-4">👥</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Gestion des participants
              </h4>
              <p className="text-gray-600">
                Suivez les inscriptions en temps réel, gérez les listes de participants 
                et envoyez des notifications automatiques.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="text-blue-600 text-4xl mb-4">📊</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Tableau de bord intuitif
              </h4>
              <p className="text-gray-600">
                Visualisez toutes vos données importantes en un coup d'œil avec 
                notre interface moderne et responsive.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="text-4xl font-bold text-blue-600 mb-2">100+</div>
              <p className="text-gray-600">Événements créés</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <p className="text-gray-600">Participants inscrits</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
              <p className="text-gray-600">Organisateurs actifs</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <h3 className="text-3xl font-bold text-white mb-4">
              Prêt à créer votre premier événement ?
            </h3>
            <p className="text-xl text-blue-100 mb-8">
              Rejoignez My Event aujourd'hui et commencez à organiser des événements mémorables
            </p>
            <Link 
              to="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition duration-300 inline-block"
            >
              Commencer gratuitement
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-xl font-bold text-white mb-4">My Event</h4>
              <p className="text-sm">
                La plateforme de gestion d'événements simple et efficace.
              </p>
            </div>
            <div>
              <h5 className="text-lg font-semibold text-white mb-3">Liens rapides</h5>
              <ul className="space-y-2 text-sm">
                <li><Link to="/events" className="hover:text-white">Événements</Link></li>
                <li><Link to="/about" className="hover:text-white">À propos</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-lg font-semibold text-white mb-3">Support</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">FAQ</a></li>
                <li><a href="#" className="hover:text-white">Guide d'utilisation</a></li>
                <li><a href="#" className="hover:text-white">Conditions d'utilisation</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-lg font-semibold text-white mb-3">Contact</h5>
              <p className="text-sm">
                Email: contact@myevent.com<br />
                Tél: +33 1 23 45 67 89
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm">
            <p>&copy; 2024 My Event. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
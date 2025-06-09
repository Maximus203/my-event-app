import {
  Button,
  Input,
  LoadingSpinner
} from '@/components/ui';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useToast } from '@/hooks/useToast';
import { eventService } from '@/services/eventService';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Calendar,
  Clock,
  FileText,
  MapPin,
  Users
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface EventForm {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  maxParticipants: string;
}

const CreateEditEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { handleError } = useErrorHandler();
  
  const isEdit = Boolean(id);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(isEdit);
  const [form, setForm] = useState<EventForm>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    maxParticipants: '',
  });

  useEffect(() => {
    if (isEdit && id) {
      loadEvent(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, id]);
  const loadEvent = useCallback(async (eventId: string) => {
    setLoadingEvent(true);
    try {
      console.log('Loading event with ID:', eventId);
      const response = await eventService.getEventById(eventId);
      
      if (response.success && response.data) {
        const event = response.data;
        
        // Convertir les données de l'événement au format du formulaire
        const eventDate = new Date(event.date);
        const formData = {
          title: event.title,
          description: event.description || '',
          date: eventDate.toISOString().split('T')[0], // Format YYYY-MM-DD
          time: eventDate.toTimeString().slice(0, 5), // Format HH:MM
          location: event.location || '',
          maxParticipants: event.maxParticipants ? event.maxParticipants.toString() : '',
        };
        
        setForm(formData);
      } else {
        showToast({
          type: 'error',
          title: 'Erreur',
          message: 'Événement non trouvé',
        });
        navigate('/events');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'événement:', error);
      handleError(error);
      navigate('/events');
    } finally {
      setLoadingEvent(false);
    }
  }, [handleError, navigate, showToast]);

  const validateForm = (): boolean => {
    if (!form.title.trim()) {
      showToast({
        type: 'warning',
        title: 'Titre requis',
        message: 'Veuillez saisir un titre pour votre événement.',
      });
      return false;
    }

    if (!form.description.trim()) {
      showToast({
        type: 'warning',
        title: 'Description requise',
        message: 'Veuillez saisir une description pour votre événement.',
      });
      return false;
    }

    if (!form.date) {
      showToast({
        type: 'warning',
        title: 'Date requise',
        message: 'Veuillez sélectionner une date pour votre événement.',
      });
      return false;
    }

    if (!form.time) {
      showToast({
        type: 'warning',
        title: 'Heure requise',
        message: 'Veuillez sélectionner une heure pour votre événement.',
      });
      return false;
    }

    if (!form.location.trim()) {
      showToast({
        type: 'warning',
        title: 'Lieu requis',
        message: 'Veuillez saisir le lieu de votre événement.',
      });
      return false;
    }

    // Vérifier que la date n'est pas dans le passé
    const eventDate = new Date(`${form.date}T${form.time}`);
    if (eventDate < new Date()) {
      showToast({
        type: 'error',
        title: 'Date invalide',
        message: 'La date et l\'heure de l\'événement ne peuvent pas être dans le passé.',
      });
      return false;
    }

    // Vérifier le nombre maximum de participants
    if (form.maxParticipants && (parseInt(form.maxParticipants) < 1 || parseInt(form.maxParticipants) > 10000)) {
      showToast({
        type: 'error',
        title: 'Nombre de participants invalide',
        message: 'Le nombre maximum de participants doit être entre 1 et 10000.',
      });
      return false;
    }

    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    console.log("Form data before submission:", form);

    setIsLoading(true);
    
    try {      // Préparer les données de l'événement (exclure le champ tags qui n'existe pas dans le backend)
      const eventDateTime = new Date(`${form.date}T${form.time}`);
      const eventData = {
        title: form.title,
        description: form.description,
        date: eventDateTime.toISOString(),
        location: form.location,
        maxParticipants: form.maxParticipants ? parseInt(form.maxParticipants) : undefined,
      };

      let eventResult;

      if (isEdit && id) {
        // Modification d'un événement existant
        console.log('Updating event with ID:', id);
        eventResult = await eventService.updateEvent(id, eventData);
      } else {
        // Création d'un nouvel événement
        console.log('Creating new event');
        eventResult = await eventService.createEvent(eventData);
      }

      if (eventResult.success) {
        console.log('Événement sauvegardé:', eventResult.data);
        
        showToast({
          type: 'success',
          title: isEdit ? 'Événement modifié' : 'Événement créé',
          message: isEdit 
            ? 'Votre événement a été modifié avec succès !'
            : 'Votre événement a été créé avec succès !',
        });
        
        navigate('/events');
      } else {
        throw new Error(eventResult.message || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:from-blue-950 dark:to-indigo-950 bg-gradient-to-br transition-colors duration-300">
      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {isEdit ? 'Modifier l\'événement' : 'Créer un nouvel événement'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {isEdit 
                ? 'Modifiez les informations de votre événement.'
                : 'Remplissez les informations pour créer votre événement.'
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              {/* Informations de base */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <Input
                    label="Titre de l'événement *"
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleInputChange}
                    placeholder="Ex: Conférence Tech 2025"
                    icon={<FileText className="h-5 w-5" />}
                    fullWidth
                    required
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Décrivez votre événement en détail..."
                    required
                  />
                </div>

                <Input
                  label="Date de l'événement *"
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleInputChange}
                  icon={<Calendar className="h-5 w-5" />}
                  fullWidth
                  required
                />

                <Input
                  label="Heure de début *"
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleInputChange}
                  icon={<Clock className="h-5 w-5" />}
                  fullWidth
                  required
                />

                <div className="lg:col-span-2">
                  <Input
                    label="Lieu de l'événement *"
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleInputChange}
                    placeholder="Ex: Dakar, Sénégal"
                    icon={<MapPin className="h-5 w-5" />}
                    fullWidth
                    required
                  />
                </div>

                <Input
                  label="Nombre maximum de participants"
                  type="number"
                  name="maxParticipants"
                  value={form.maxParticipants}
                  onChange={handleInputChange}
                  placeholder="Laissez vide pour illimité"
                  icon={<Users className="h-5 w-5" />}
                  min="1"
                  max="10000"
                  fullWidth
                />
              </div>
            </div>

            {/* Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">Conseils pour un événement réussi :</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Utilisez un titre accrocheur et descriptif</li>
                    <li>Soyez précis sur le lieu et l'heure</li>
                    <li>Décrivez clairement ce qui attend les participants</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex justify-center space-x-3 w-full">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/events')}
                  size="lg"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  loading={isLoading}
                  size="lg"
                >
                  {isEdit ? 'Modifier l\'événement' : 'Créer l\'événement'}
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateEditEventPage;

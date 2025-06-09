/**
 * EventImageUpload : Composant pour l'upload d'images d'événements
 */

import React, { useCallback, useState } from 'react';
import { useToast } from '../../hooks/useToast';
import { uploadService } from '../../services/uploadService';

interface EventImageUploadProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  onFileChange?: (file: File | null) => void;
  accept?: string;
  maxSizeMB?: number;
  preview?: boolean;
  className?: string;
  type?: 'imageUrl' | 'bannerImage' | 'videoUrl';
}

const EventImageUpload: React.FC<EventImageUploadProps> = ({
  label,
  value,
  onChange,
  onFileChange,
  accept = 'image/*',
  maxSizeMB = 50,
  preview = true,
  className = '',
  type = 'imageUrl'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(value || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { showToast } = useToast();

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation du fichier
    const isVideo = type === 'videoUrl';
    const validation = isVideo 
      ? uploadService.validateVideoFile(file)
      : uploadService.validateImageFile(file);

    if (!validation.isValid) {
      showToast({
        type: 'error',
        title: 'Fichier invalide',
        message: validation.error || 'Le fichier sélectionné n\'est pas valide'
      });
      return;
    }

    setSelectedFile(file);
    onFileChange?.(file);

    // Créer une preview
    if (preview) {
      const url = uploadService.getPreviewUrl(file);
      setPreviewUrl(url);
    }

    // Upload automatique ou différé selon les besoins
    // Pour l'instant, on stocke juste le fichier et on laisse le parent gérer l'upload
  }, [type, preview, onFileChange, showToast]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const url = await uploadService.uploadEventImage(selectedFile, type);
      onChange(url);
      
      showToast({
        type: 'success',
        title: 'Upload réussi',
        message: 'Le fichier a été uploadé avec succès'
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erreur d\'upload',
        message: error instanceof Error ? error.message : 'Erreur lors de l\'upload'
      });
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, type, onChange, showToast]);

  const handleRemove = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl('');
    onFileChange?.(null);
    onChange('');
    
    // Libérer l'URL de preview si elle existe
    if (previewUrl && previewUrl.startsWith('blob:')) {
      uploadService.revokePreviewUrl(previewUrl);
    }
  }, [previewUrl, onChange, onFileChange]);

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      {/* Zone de drop ou sélection de fichier */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
        {previewUrl ? (
          <div className="space-y-4">
            {/* Preview */}
            {type === 'videoUrl' ? (
              <video
                src={previewUrl}
                controls
                className="mx-auto max-h-48 rounded-lg"
              />
            ) : (
              <img
                src={previewUrl}
                alt="Preview"
                className="mx-auto max-h-48 object-cover rounded-lg"
              />
            )}
            
            {/* Actions */}
            <div className="flex justify-center space-x-2">
              {selectedFile && !value && (
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUploading ? 'Upload...' : 'Uploader'}
                </button>
              )}
              
              <button
                type="button"
                onClick={handleRemove}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        ) : (
          <div>
            <input
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              className="hidden"
              id={`file-upload-${type}`}
            />
            <label
              htmlFor={`file-upload-${type}`}
              className="cursor-pointer flex flex-col items-center"
            >
              <svg
                className="w-12 h-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Cliquez pour sélectionner</span> ou glissez un fichier
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {type === 'videoUrl' ? 'MP4, AVI, MOV, WMV, WEBM' : 'PNG, JPG, GIF, WEBP'} jusqu'à {maxSizeMB}MB
              </p>
            </label>
          </div>
        )}
      </div>

      {/* URL manuelle (optionnel) */}
      {!selectedFile && (
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Ou saisissez une URL directement :
          </label>
          <input
            type="url"
            value={value || ''}
            onChange={(e) => {
              onChange(e.target.value);
              setPreviewUrl(e.target.value);
            }}
            placeholder="https://cherif-diouf.me/images/photo.webp"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      )}
    </div>
  );
};

export default EventImageUpload;

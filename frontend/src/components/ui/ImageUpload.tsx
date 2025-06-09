import { clsx } from 'clsx';
import { Upload, X } from 'lucide-react';
import type { ChangeEvent, DragEvent } from 'react';
import { useCallback, useState } from 'react';

interface UploadedFile {
  file: File;
  preview: string;
  id: string;
}

interface ImageUploadProps {
  onUpload: (files: File[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeInMB?: number;
  acceptedFormats?: string[];
  className?: string;
  disabled?: boolean;
  existingImages?: string[];
}

export const ImageUpload = ({
  onUpload,
  multiple = false,
  maxFiles = 1,
  maxSizeInMB = 30,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  className,
  disabled = false,
  existingImages = [],
}: ImageUploadProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!acceptedFormats.includes(file.type)) {
      return `Format non supporté. Formats acceptés: ${acceptedFormats.map(f => f.split('/')[1]).join(', ')}`;
    }
    
    if (file.size > maxSizeInMB * 1024 * 1024) {
      return `Fichier trop volumineux. Taille maximale: ${maxSizeInMB}MB`;
    }
    
    return null;
  };

  const processFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const currentCount = uploadedFiles.length + existingImages.length;
    
    if (!multiple && fileArray.length > 1) {
      setError('Un seul fichier autorisé');
      return;
    }
    
    if (currentCount + fileArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} fichier(s) autorisé(s)`);
      return;
    }

    const validFiles: UploadedFile[] = [];
    
    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      
      const id = Math.random().toString(36).substr(2, 9);
      const preview = URL.createObjectURL(file);
      validFiles.push({ file, preview, id });
    }

    setError(null);
    const newUploadedFiles = multiple ? [...uploadedFiles, ...validFiles] : validFiles;
    setUploadedFiles(newUploadedFiles);
    onUpload(newUploadedFiles.map(f => f.file));
  }, [uploadedFiles, multiple, maxFiles, acceptedFormats, maxSizeInMB, onUpload, existingImages.length]);

  const handleDrag = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles, disabled]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;
    
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  }, [processFiles, disabled]);

  const removeFile = useCallback((id: string) => {
    setUploadedFiles(prev => {
      const updated = prev.filter(file => file.id !== id);
      // Libérer l'URL de l'objet pour éviter les fuites mémoire
      const removedFile = prev.find(file => file.id === id);
      if (removedFile) {
        URL.revokeObjectURL(removedFile.preview);
      }
      onUpload(updated.map(f => f.file));
      return updated;
    });
    setError(null);
  }, [onUpload]);

  const totalFiles = uploadedFiles.length + existingImages.length;

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Zone de drop */}
      <div
        className={clsx(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors duration-200',
          {
            'border-blue-400 bg-blue-50 dark:bg-blue-900/20': dragActive,
            'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500': !dragActive && !disabled,
            'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-not-allowed': disabled,
          }
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple={multiple}
          accept={acceptedFormats.join(',')}
          onChange={handleChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <div className="mt-4">
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {dragActive ? 'Déposez votre fichier ici' : 'Glissez-déposez votre image ici'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              ou{' '}
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                cliquez pour parcourir
              </span>
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              {acceptedFormats.map(f => f.split('/')[1]).join(', ').toUpperCase()} • 
              Max {maxSizeInMB}MB • 
              {multiple ? `Max ${maxFiles} fichiers` : 'Un seul fichier'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Images existantes */}
      {existingImages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Images actuelles
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {existingImages.map((src, index) => (
              <div key={index} className="relative group">
                <img
                  src={src}
                  alt={`Image ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prévisualisation des fichiers uploadés */}
      {uploadedFiles.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nouvelles images ({uploadedFiles.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="relative group">
                <img
                  src={file.preview}
                  alt={file.file.name}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg" />
                <button
                  onClick={() => removeFile(file.id)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-1 left-1 right-1">
                  <p className="text-xs text-white bg-black bg-opacity-50 px-1 py-0.5 rounded truncate">
                    {file.file.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Informations sur les limites */}
      {totalFiles > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {totalFiles} / {maxFiles} fichier(s)
        </div>
      )}
    </div>
  );
};

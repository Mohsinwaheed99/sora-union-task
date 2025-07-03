'use client';

import React from 'react';
import { Download, FileText, Image, Video, Music, Archive, File, Eye } from 'lucide-react';
import Modal from '../Modal'; // Adjust import path as needed

interface FileType {
  id: string;
  name: string;
  type: string;
  size: number;
  folderId: string | null;
  url: string;
  createdAt: string;
  originalName: string;
  cloudinaryPublicId?: string;
}

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileType | null;
  onDownload?: (file: FileType) => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  file,
  onDownload,
}) => {
  if (!file) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-6 h-6" />;
    if (type.startsWith('video/')) return <Video className="w-6 h-6" />;
    if (type.startsWith('audio/')) return <Music className="w-6 h-6" />;
    if (type.includes('pdf') || type.includes('document')) return <FileText className="w-6 h-6" />;
    if (type.includes('zip') || type.includes('archive')) return <Archive className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  const renderPreview = () => {
    const fileType = file.type.toLowerCase();

    // Image preview
    if (fileType.startsWith('image/')) {
      return (
        <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4 mb-4">
          <img
            src={file.url}
            alt={file.name}
            className="max-w-full max-h-96 object-contain rounded-lg shadow-sm"
            loading="lazy"
          />
        </div>
      );
    }

    // Video preview
    if (fileType.startsWith('video/')) {
      return (
        <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4 mb-4">
          <video
            src={file.url}
            controls
            className="max-w-full max-h-96 rounded-lg shadow-sm"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    // Audio preview
    if (fileType.startsWith('audio/')) {
      return (
        <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4 mb-4">
          <audio
            src={file.url}
            controls
            className="w-full max-w-md"
          >
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }

    // PDF preview (using iframe)
    if (fileType.includes('pdf')) {
      return (
        <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-8 mb-4">
          <div className="text-gray-400 mb-4">
            <FileText className="w-16 h-16" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">PDF Document</h3>
          <p className="text-sm text-gray-500 text-center mb-4">
            PDF preview is not available in this browser. Click the button below to open or download the file.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => window.open(file.url, '_blank')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>Open PDF</span>
            </button>
            {onDownload && (
              <button
                onClick={() => onDownload(file)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    // Text preview for small text files
    if (fileType.startsWith('text/') && file.size < 1024 * 1024) { // Less than 1MB
      return (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <iframe
            src={file.url}
            className="w-full h-64 rounded border-none"
            title={file.name}
          />
        </div>
      );
    }

    // Default preview for unsupported file types
    return (
      <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-8 mb-4">
        <div className="text-gray-400 mb-2">
          {getFileIcon(file.type)}
        </div>
        <p className="text-sm text-gray-500 text-center">
          Preview not available for this file type
        </p>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      modalWidth={800}
      modalHeight={600}
      className="max-w-4xl max-h-[90vh] overflow-y-auto"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-3">
            <div className="text-gray-600">
              {getFileIcon(file.type)}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 truncate">
                {file.originalName}
              </h2>
              <p className="text-sm text-gray-500">
                {formatFileSize(file.size)} • {file.type}
              </p>
            </div>
          </div>
          {onDownload && (
            <button
              onClick={() => onDownload(file)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          )}
        </div>

        {/* Preview */}
        <div className="min-h-[300px]">
          {renderPreview()}
        </div>

        {/* File Details */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <h3 className="font-medium text-gray-900">File Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Created:</span>
              <span className="ml-2 text-gray-900">{formatDate(file.createdAt)}</span>
            </div>
            <div>
              <span className="text-gray-600">Size:</span>
              <span className="ml-2 text-gray-900">{formatFileSize(file.size)}</span>
            </div>
            <div>
              <span className="text-gray-600">Type:</span>
              <span className="ml-2 text-gray-900">{file.type}</span>
            </div>
            {file.cloudinaryPublicId && (
              <div>
                <span className="text-gray-600">ID:</span>
                <span className="ml-2 text-gray-900 font-mono text-xs">
                  {file.cloudinaryPublicId}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default FilePreviewModal;
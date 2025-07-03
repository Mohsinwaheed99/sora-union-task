'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Download, FileText, Image, Video, Music, Archive, File, Eye, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from '../Modal';

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
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setIsClient(true);
    
    const setupPdfWorker = async () => {
      try {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
          if ((window as any).pdfjsLib) {
            (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 
              'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          }
        };
        script.onerror = () => {
          console.error('Failed to load PDF.js');
          setPdfError('PDF preview is temporarily unavailable');
        };
        document.head.appendChild(script);

        return () => {
          if (document.head.contains(script)) {
            document.head.removeChild(script);
          }
        };
      } catch (error) {
        console.error('Error setting up PDF worker:', error);
        setPdfError('PDF preview is temporarily unavailable');
      }
    };

    setupPdfWorker();
  }, []);

  useEffect(() => {
    if (file && file.type.includes('pdf') && isClient && (window as any).pdfjsLib) {
      loadPdfDocument();
    }
  }, [file, isClient]);

  useEffect(() => {
    if (pdfDocument && canvasRef.current) {
      renderPdfPage();
    }
  }, [pdfDocument, pageNumber, scale]);

  if (!file) return null;

  const loadPdfDocument = async () => {
    if (!file || !file.type.includes('pdf') || !(window as any).pdfjsLib) return;

    setPdfLoading(true);
    setPdfError(null);

    try {
      const loadingTask = (window as any).pdfjsLib.getDocument(file.url);
      const pdf = await loadingTask.promise;
      setPdfDocument(pdf);
      setNumPages(pdf.numPages);
      setPageNumber(1);
      setPdfLoading(false);
    } catch (error) {
      console.error('Error loading PDF:', error);
      setPdfError('Failed to load PDF. The file might be corrupted or not accessible.');
      setPdfLoading(false);
    }
  };

  const renderPdfPage = async () => {
    if (!pdfDocument || !canvasRef.current) return;

    try {
      const page = await pdfDocument.getPage(pageNumber);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      const viewport = page.getViewport({ scale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
    } catch (error) {
      console.error('Error rendering PDF page:', error);
    }
  };

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

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(numPages, prev + 1));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(3, prev + 0.2));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.2));
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

    // Enhanced PDF preview with canvas rendering
    if (fileType.includes('pdf') && isClient) {
      return (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          {/* PDF Controls */}
          <div className="flex items-center justify-between bg-white rounded-lg p-3 mb-4 shadow-sm">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">
                PDF Document
              </span>
              
              {numPages > 0 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={goToPrevPage}
                    disabled={pageNumber <= 1}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <span className="text-sm text-gray-600">
                    {pageNumber} / {numPages}
                  </span>
                  
                  <button
                    onClick={goToNextPage}
                    disabled={pageNumber >= numPages}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {numPages > 0 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={zoomOut}
                    disabled={scale <= 0.5}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  
                  <span className="text-sm text-gray-600">
                    {Math.round(scale * 100)}%
                  </span>
                  
                  <button
                    onClick={zoomIn}
                    disabled={scale >= 3}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => window.open(file.url, '_blank')}
                className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Eye className="w-4 h-4" />
                <span>Open</span>
              </button>
              {onDownload && (
                <button
                  onClick={() => onDownload(file)}
                  className="flex items-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              )}
            </div>
          </div>

          {/* PDF Document */}
          <div className="flex justify-center bg-white rounded-lg p-4 min-h-[400px] overflow-auto">
            {pdfLoading ? (
              <div className="flex flex-col items-center justify-center text-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-sm text-gray-600">Loading PDF...</p>
              </div>
            ) : pdfError ? (
              <div className="flex flex-col items-center justify-center text-center p-8">
                <div className="text-red-400 mb-4">
                  <FileText className="w-16 h-16" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">PDF Preview Error</h3>
                <p className="text-sm text-red-600 mb-4">{pdfError}</p>
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
            ) : pdfDocument ? (
              <div className="flex flex-col items-center">
                <canvas
                  ref={canvasRef}
                  className="border border-gray-200 rounded-lg shadow-sm max-w-full"
                  style={{ maxHeight: '70vh' }}
                />
              </div>
            ) : (
              // Fallback iframe for cases where canvas rendering fails
              <iframe
                src={`/api/proxy-pdf?url=${encodeURIComponent(file.url)}`}
                className="w-full h-96 border-0 rounded-lg shadow-sm"
                title={file.name}
                onError={() => setPdfError('PDF preview unavailable')}
              />
            )}
          </div>
        </div>
      );
    }

    // Fallback for PDF when not on client side
    if (fileType.includes('pdf') && !isClient) {
      return (
        <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-8 mb-4">
          <div className="text-gray-400 mb-4">
            <FileText className="w-16 h-16" />
          </div>
          <p className="text-sm text-gray-500 text-center mb-4">
            PDF preview is loading...
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
      modalWidth={900}
      modalHeight={700}
      className="max-w-5xl max-h-[95vh] overflow-y-auto"
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
          {onDownload && !file.type.includes('pdf') && (
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
        <div className="min-h-[400px]">
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
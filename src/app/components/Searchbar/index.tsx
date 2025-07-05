import React, { useState, useEffect, useRef } from 'react';
import { Search, X, File, Folder, ArrowRight, Loader2 } from 'lucide-react';
import Input from '../Input';
import { formatDate, formatFileSize, getMimeTypeFromExtension } from '@/app/utils/functions';
import { searchFiles } from '@/app/services/search';

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
  updatedAt?: string;
}

interface FolderType {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt?: string;
}

interface SearchResult {
  folders: Array<FolderType & { type: 'folder' }>;
  files: Array<FileType & { type: 'file' }>;
}

interface SearchBarProps {
  onNavigateToFolder: (folderId: string, folderName: string) => void;
  onFilePreview: (file: FileType) => void;
  onFileDownload: (file: FileType) => void;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onNavigateToFolder,
  onFilePreview,
  onFileDownload,
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult>({ folders: [], files: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults({ folders: [], files: [] });
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const searchResults = await searchFiles(searchQuery);
      
      const transformedResults: SearchResult = {
        folders: searchResults.folders.map(folder => ({ ...folder, type: 'folder' as const })),
        files: searchResults.files.map(file => ({ ...file, type: 'file' as const }))
      };
      
      setResults(transformedResults);
      setIsOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults({ folders: [], files: [] });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        handleSearch(query);
      } else {
        setResults({ folders: [], files: [] });
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    setQuery('');
    setResults({ folders: [], files: [] });
    setIsOpen(false);
    setError(null);
    inputRef.current?.focus();
  };

  const handleFolderClick = (folder: FolderType & { type: 'folder' }) => {
    onNavigateToFolder(folder.id, folder.name);
    setIsOpen(false);
    setQuery('');
  };

  const handleFileClick = (file: FileType & { type: 'file' }) => {
    const fileForPreview: FileType = {
      id: file.id,
      name: file.name,
      type: file.type === 'file' ? getMimeTypeFromExtension(file.originalName) : file.type,
      size: file.size,
      folderId: file.folderId,
      url: file.url,
      createdAt: file.createdAt,
      originalName: file.originalName,
      cloudinaryPublicId: file.cloudinaryPublicId,
      updatedAt: file.updatedAt
    };
    
    onFilePreview(fileForPreview);
    setIsOpen(false);
  };

  const handleFileDownload = (file: FileType & { type: 'file' }) => {
    const fileForDownload: FileType = {
      id: file.id,
      name: file.name,
      type: file.type === 'file' ? getMimeTypeFromExtension(file.originalName) : file.type,
      size: file.size,
      folderId: file.folderId,
      url: file.url,
      createdAt: file.createdAt,
      originalName: file.originalName,
      cloudinaryPublicId: file.cloudinaryPublicId,
      updatedAt: file.updatedAt
    };
    
    onFileDownload(fileForDownload);
  };

  const totalResults = results.folders.length + results.files.length;

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-gray-400" />
          )}
        </div>
         <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder="Search files and folders..."
          className='pl-10 pr-10 py-2'
        />
        {query && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <span
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
            >
              <X className="h-5 w-5" />
            </span>
          </div>
        )}
      </div>

      {isOpen && (query.trim() || error) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-y-auto">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border-b border-red-200">
              {error}
            </div>
          )}

          {!error && totalResults === 0 && !isLoading && (
            <div className="p-4 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No results found for "{query}"</p>
            </div>
          )}

          {!error && totalResults > 0 && (
            <div className="p-2">
              <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 mb-2">
                {totalResults} result{totalResults !== 1 ? 's' : ''} found
              </div>

              {results.folders.length > 0 && (
                <div className="mb-4">
                  <div className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-50 rounded mb-2">
                    Folders ({results.folders.length})
                  </div>
                  {results.folders.map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => handleFolderClick(folder)}
                      className="w-full flex items-center px-3 py-2 text-sm text-left hover:bg-gray-50 rounded-md group"
                    >
                      <Folder className="h-4 w-4 text-blue-500 mr-3 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {folder.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Created {formatDate(folder.createdAt)}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}

              {results.files.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-50 rounded mb-2">
                    Files ({results.files.length})
                  </div>
                  {results.files.map((file) => (
                    <div key={file.id} className="flex items-center px-3 py-2 text-sm hover:bg-gray-50 rounded-md group">
                      <File className="h-4 w-4 text-gray-500 mr-3 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {file.originalName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatFileSize(file.size)} • {formatDate(file.createdAt)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleFileClick(file)}
                          className="text-blue-600 hover:text-blue-800 cursor-pointer text-xs font-medium"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => handleFileDownload(file)}
                          className="text-green-600 hover:text-green-800 cursor-pointer text-xs font-medium"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
'use client';
import React, { useState, useEffect, JSX } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Upload, 
  Files, 
  FolderPlus,
  ArrowLeft,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import CreateFolderModal from '../CreateFolder';
import { Header } from '../Header';
import Breadcrumbs from '../BreadCrumb';
import Modal from '../Modal';

import {
  createFolder as createFolderService,
  deleteFolder as deleteFolderService,
  renameFolder as renameFolderService,
  fetchFolders as fetchFoldersService,
  fetchFolderPath as fetchFolderPathService, 
} from '../../services/folder.service';

import {
  deleteFile as deleteFileService,
  renameFile as renameFileService,
  fetchFiles as fetchFilesService,
  uploadFiles as uploadFilesService
} from '../../services/file.service';
import FilePreviewModal from '../FilePreview';
import SearchBar from '../Searchbar';
import Input from '../Input';
import Button from '../Button';
import Item from '../Items';

interface FolderType {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt?: string;
  path?: string[];
  fileCount?: number;
}

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

interface PathItem {
  id: string;
  name: string;
}

interface EditingItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  createdAt: string;
  updatedAt?: string;
}

export default function Dashboard(): JSX.Element {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<PathItem[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [files, setFiles] = useState<FileType[]>([]);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRenamingFolder, setIsRenamingFolder] = useState<boolean>(false);
  const [isDeletingFolder, setIsDeletingFolder] = useState<boolean>(false);
  const [isRenamingFile, setIsRenamingFile] = useState<boolean>(false);
  const [isDeletingFile, setIsDeletingFile] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [previewFile, setPreviewFile] = useState<FileType | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [folderToDelete, setFolderToDelete] = useState<{ id: string; name: string; fileCount?: number } | null>(null);
  const [deleteFolderError, setDeleteFolderError] = useState<string | null>(null);

  const updateURL = (folderId: string | null): void => {
    const params = new URLSearchParams(searchParams);
    if (folderId) {
      params.set('folder', folderId);
    } else {
      params.delete('folder');
    }
    
    const newURL = `${window.location.pathname}?${params.toString()}`;
    router.replace(newURL);
  };

  useEffect(() => {
    if (session?.user?.id && !isInitialized) {
      const folderIdFromURL = searchParams.get('folder');
      
      if (folderIdFromURL) {
        setCurrentFolderId(folderIdFromURL);
        setFolderPath([]);
      } else {
        setCurrentFolderId(null);
        setFolderPath([]);
      }
      setIsInitialized(true);
    }
  }, [session?.user?.id, searchParams, isInitialized]);

  const fetchFolders = async (parentId: string | null = null): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await fetchFoldersService(parentId);
      setFolders(data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
      setError(error instanceof Error ? error.message : 'Failed to load folders');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFiles = async (folderId: string | null = null): Promise<void> => {
    try {
      setError(null);
      
      const data = await fetchFilesService(folderId);
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError(error instanceof Error ? error.message : 'Failed to load files');
    }
  };

  const createFolder = async (): Promise<void> => {
    if (!newFolderName.trim()) return;
    
    try {
      setIsCreatingFolder(true);
      setError(null);
      
      const data = await createFolderService(newFolderName.trim(), currentFolderId);
      setFolders(prev => [data, ...prev]);
      
      setNewFolderName('');
      setIsCreateFolderOpen(false);
    } catch (error) {
      console.error('Error creating folder:', error);
      setError(error instanceof Error ? error.message : 'Failed to create folder');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleRename = async (id: string, newName: string, type: 'folder' | 'file'): Promise<void> => {
    if (!newName.trim()) return;
    
    try {
      if (type === 'folder') {
        setIsRenamingFolder(true);
        setError(null);
        
        await renameFolderService(id, newName.trim());
        
        setFolders(prev => prev.map(folder => 
          folder.id === id 
            ? { ...folder, name: newName.trim(), updatedAt: new Date().toISOString() }
            : folder
        ));
        
        setFolderPath(prev => prev.map(pathItem =>
          pathItem.id === id
            ? { ...pathItem, name: newName.trim() }
            : pathItem
        ));
        
      } else {
        setIsRenamingFile(true);
        setError(null);
        
        await renameFileService(id, newName.trim());
        
        setFiles(prev => prev.map(file => 
          file.id === id 
            ? { ...file, name: newName.trim(), updatedAt: new Date().toISOString() }
            : file
        ));
      }
      
      setEditingItem(null);
      
    } catch (error) {
      console.error(`Error updating ${type}:`, error);
      setError(error instanceof Error ? error.message : `Failed to update ${type}`);
    } finally {
      if (type === 'folder') {
        setIsRenamingFolder(false);
      } else {
        setIsRenamingFile(false);
      }
    }
  };

  const handleDelete = async (id: string, type: 'folder' | 'file'): Promise<void> => {
    if (type === 'folder') {
      const folder = folders.find(f => f.id === id);
      if (folder) {
        if (folder.fileCount && folder.fileCount > 0) {
          setFolderToDelete({ 
            id: folder.id, 
            name: folder.name, 
            fileCount: folder.fileCount 
          });
          setIsDeleteConfirmOpen(true);
          setDeleteFolderError(null);
        } else {
          await deleteFolder(folder.id);
        }
      }
    } else {
      await deleteFile(id);
    }
  };

  const deleteFolder = async (folderId: string): Promise<void> => {
    try {
      setIsDeletingFolder(true);
      setError(null);
      setDeleteFolderError(null);
      
      await deleteFolderService(folderId);
      setFolders(prev => prev.filter(folder => folder.id !== folderId));
      
      if (folderId === currentFolderId) {
        navigateBack();
      }
      
      setIsDeleteConfirmOpen(false);
      setFolderToDelete(null);
      
    } catch (error) {
      console.error('Error deleting folder:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete folder';
      setDeleteFolderError(errorMessage);
    } finally {
      setIsDeletingFolder(false);
    }
  };

  const deleteFile = async (fileId: string): Promise<void> => {
    try {
      setIsDeletingFile(true);
      setError(null);
      
      await deleteFileService(fileId);
      setFiles(prev => prev.filter(file => file.id !== fileId));
      
    } catch (error) {
      console.error('Error deleting file:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete file');
    } finally {
      setIsDeletingFile(false);
    }
  };

  const uploadFiles = async (uploadedFiles: File[]): Promise<void> => {
    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress('Starting upload...');

      const uploadedFileData = await uploadFilesService(uploadedFiles, currentFolderId);
      
      if (uploadedFileData.length > 0) {
        setFiles(prev => [...uploadedFileData, ...prev]);
        setUploadProgress(`Successfully uploaded ${uploadedFileData.length} file(s)`);
      }

    } catch (error) {
      console.error('Error uploading files:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload files');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(''), 3000);
    }
  };

  useEffect(() => {
    const initializeFolderState = async () => {
      if (session?.user?.id && !isInitialized) {
        const folderIdFromURL = searchParams.get('folder');
        
        if (folderIdFromURL) {
          try {
            setIsLoading(true);
            const { folder, path } = await fetchFolderPathService(folderIdFromURL);
            
            setCurrentFolderId(folderIdFromURL);
            setFolderPath(path); 
          } catch (error) {
            console.error('Error fetching folder path:', error);
            setCurrentFolderId(null);
            setFolderPath([]);
            updateURL(null);
          } finally {
            setIsLoading(false);
          }
        } else {
          setCurrentFolderId(null);
          setFolderPath([]);
        }
        setIsInitialized(true);
      }
    };

    initializeFolderState();
  }, [session?.user?.id, searchParams, isInitialized]);

  useEffect(() => {
    if (session?.user?.id && isInitialized) {
      fetchFolders(currentFolderId);
      fetchFiles(currentFolderId);
    }
  }, [currentFolderId, session?.user?.id, isInitialized]);

  const validateFolderAccess = async (folderId: string): Promise<boolean> => {
    try {
      await fetchFolderPathService(folderId);
      return true;
    } catch (error) {
      console.error('Folder access validation failed:', error);
      return false;
    }
  };

  const handleFolderDoubleClick = async (folderId: string, folderName: string): Promise<void> => {
    try {
      const isValidFolder = await validateFolderAccess(folderId);
      if (!isValidFolder) {
        setError('Folder not found or access denied');
        return;
      }

      const newPath = [...folderPath, { id: folderId, name: folderName }];
      setCurrentFolderId(folderId);
      setFolderPath(newPath);
      updateURL(folderId);
    } catch (error) {
      console.error('Error navigating to folder:', error);
      setError('Failed to navigate to folder');
    }
  };

  const navigateBack = (): void => {
    if (folderPath.length > 0) {
      const newPath = [...folderPath];
      newPath.pop();
      setFolderPath(newPath);
      
      const newFolderId = newPath.length > 0 ? newPath[newPath.length - 1].id : null;
      setCurrentFolderId(newFolderId);
      updateURL(newFolderId);
    }
  };

  const navigateToHome = (): void => {
    setCurrentFolderId(null);
    setFolderPath([]);
    updateURL(null);
  };

  const navigateToBreadcrumb = async (folderId: string | null, targetIndex: number): Promise<void> => {
    try {
      if (folderId === null) {
        navigateToHome();
        return;
      }

      const isValidFolder = await validateFolderAccess(folderId);
      if (!isValidFolder) {
        setError('Folder not found or access denied');
        return;
      }

      const newPath = folderPath.slice(0, targetIndex + 1);
      setCurrentFolderId(folderId);
      setFolderPath(newPath);
      updateURL(folderId);
    } catch (error) {
      console.error('Error navigating to breadcrumb:', error);
      setError('Failed to navigate to folder');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const uploadedFiles = Array.from(event.target.files);
    await uploadFiles(uploadedFiles);
    
    event.target.value = '';
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (folderToDelete) {
      await deleteFolder(folderToDelete.id);
    }
  };

  const handleCancelDelete = (): void => {
    setIsDeleteConfirmOpen(false);
    setFolderToDelete(null);
    setDeleteFolderError(null);
  };

  const handleFolderNameKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      createFolder();
    }
  };

  const handleFileDownload = (file: FileType) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.originalName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFilePreview = (file: FileType) => {
    setPreviewFile(file);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewFile(null);
  };

  const navigateToFolder = async (folderId: string, folderName: string): Promise<void> => {
    await handleFolderDoubleClick(folderId, folderName);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
              <Button
                onClick={() => setError(null)}
                variant="outline"
                size="sm"
                className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
              >
                Dismiss
              </Button>
            </div>
          )}

          <div className="mb-6">
            <SearchBar
              onNavigateToFolder={navigateToFolder}
              onFilePreview={handleFilePreview}
              onFileDownload={handleFileDownload}
              className="max-w-md"
            />
          </div>

          <Breadcrumbs
            folderPath={folderPath}
            onNavigateHome={navigateToHome}
            onNavigateToFolder={(folderId, index) => navigateToBreadcrumb(folderId, index)}
          />

          <div className="flex flex-wrap gap-4 mb-6">
            <Button
              onClick={() => setIsCreateFolderOpen(true)}
              variant="primary"
              isLoading={isCreatingFolder}
              disabled={isCreatingFolder}
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              New Folder
            </Button>
            
           <label className="cursor-pointer">
            <Button
                variant="secondary"
                disabled={isUploading}
                isLoading={isUploading}
                loadingText="Uploading..."
                onClick={() => document.getElementById('upload-input')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
            </Button>

            <Input
              id="upload-input"
              type="file"
              multiple
              required
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
            </label>
            
            {folderPath.length > 0 && (
              <Button
                onClick={navigateBack}
                variant="outline"
                size="md"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
          </div>

          {uploadProgress && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-600">{uploadProgress}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
              <span className="text-gray-600">Loading folders...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {folders.map((folder) => (
                <Item
                  key={folder.id}
                  item={folder}
                  itemType="folder"
                  onDoubleClick={handleFolderDoubleClick}
                  onDelete={handleDelete}
                  onRename={handleRename}
                  editingItem={editingItem}
                  isRenaming={isRenamingFolder}
                  isDeleting={isDeletingFolder}
                />
              ))}

              {files.map((file) => (
                <Item
                  key={file.id}
                  item={file}
                  itemType="file"
                  onFilePreview={handleFilePreview}
                  onFileDownload={handleFileDownload}
                  onDelete={handleDelete}
                  onRename={handleRename}
                  editingItem={editingItem}
                  isRenaming={isRenamingFile}
                  isDeleting={isDeletingFile}
                />
              ))}
            </div>
          )}

          {!isLoading && folders.length === 0 && files.length === 0 && (
            <div className="text-center py-12">
              <Files className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No files or folders</h3>
              <p className="text-gray-500">Create a folder or upload files to get started.</p>
            </div>
          )}
        </div>
      </main>

      <CreateFolderModal
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        onCreateFolder={createFolder}
        onKeyPress={handleFolderNameKeyPress}
        isCreatingFolder={isCreatingFolder}
      />

      <FilePreviewModal
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        file={previewFile}
        onDownload={handleFileDownload}
      />

      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={handleCancelDelete}
        modalWidth={480}
        className="max-w-md"
      >
        <div className="pt-4">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">
                Delete Folder
              </h3>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-sm text-gray-700 mb-3">
              Are you sure you want to delete the folder "{folderToDelete?.name}"?
            </p>
            {folderToDelete?.fileCount && folderToDelete.fileCount > 0 && (
              <p className="text-sm text-orange-600 font-medium mb-3">
                This folder contains {folderToDelete.fileCount} file{folderToDelete.fileCount !== 1 ? 's' : ''}.
              </p>
            )}
            <p className="text-sm text-red-600 font-medium">
              This action cannot be undone. All files and subfolders within this folder will be permanently deleted.
            </p>
          </div>

          {deleteFolderError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{deleteFolderError}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button
              onClick={handleCancelDelete}
              variant="outline"
              disabled={isDeletingFolder}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              variant="primary"
              isLoading={isDeletingFolder}
              disabled={isDeletingFolder}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              {isDeletingFolder ? 'Deleting...' : 'Delete Folder'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
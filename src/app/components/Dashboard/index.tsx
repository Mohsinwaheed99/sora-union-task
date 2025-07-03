'use client';
import React, { useState, useEffect, JSX, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { 
  Upload, 
  Files, 
  FolderPlus,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import CreateFolderModal from '../CreateFolder';
import ContextMenuComponent from '../ContextMenu';
import FileComponent from '../File';
import FolderComponent from '../Folder';
import { Header } from '../Header';
import Breadcrumbs from '../BreadCrumb';

import {
  createFolder as createFolderService,
  deleteFolder as deleteFolderService,
  renameFolder as renameFolderService,
  fetchFolders as fetchFoldersService,
} from '../../services/folder.service';

import {
  deleteFile as deleteFileService,
  renameFile as renameFileService,
  fetchFiles as fetchFilesService,
  uploadFiles as uploadFilesService
} from '../../services/file.service';
import FilePreviewModal from '../FilePreview';
import SearchBar from '../Searchbar';

interface FolderType {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt?: string;
  path?: string[];
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

interface ContextMenuData {
  x: number;
  y: number;
  item: FolderType | FileType;
  type: 'folder' | 'file';
}
interface EditingItem extends FolderType {
  type: 'folder';
}

interface EditingFile extends FileType {
  type: 'file';
}

type EditingItemType = EditingItem | EditingFile | null;

export default function Dashboard(): JSX.Element {
  const { data: session } = useSession();
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<PathItem[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [files, setFiles] = useState<FileType[]>([]);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuData | null>(null);
  const [editingItem, setEditingItem] = useState<EditingItemType>(null);
  const [editName, setEditName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isRenamingFolder, setIsRenamingFolder] = useState<boolean>(false);
  const [isDeletingFolder, setIsDeletingFolder] = useState<boolean>(false);
  const [isRenamingFile, setIsRenamingFile] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const [previewFile, setPreviewFile] = useState<FileType | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

  const updateFolder = async (folderId: string, newName: string): Promise<void> => {
    if (!newName.trim()) return;
    
    try {
      setIsRenamingFolder(true);
      setError(null);
      
      const data = await renameFolderService(folderId, newName.trim());
      
      setFolders(prev => prev.map(folder => 
        folder.id === folderId 
          ? { ...folder, name: newName.trim(), updatedAt: new Date().toISOString() }
          : folder
      ));
      
      setFolderPath(prev => prev.map(pathItem =>
        pathItem.id === folderId
          ? { ...pathItem, name: newName.trim() }
          : pathItem
      ));
      
    } catch (error) {
      console.error('Error updating folder:', error);
      setError(error instanceof Error ? error.message : 'Failed to update folder');
    } finally {
      setIsRenamingFolder(false);
    }
  };

  const updateFile = async (fileId: string, newName: string): Promise<void> => {
    if (!newName.trim()) return;
    
    try {
      setIsRenamingFile(true);
      setError(null);
      
      const data = await renameFileService(fileId, newName.trim());
      
      setFiles(prev => prev.map(file => 
        file.id === fileId 
          ? { ...file, name: newName.trim(), updatedAt: new Date().toISOString() }
          : file
      ));
      
    } catch (error) {
      console.error('Error updating file:', error);
      setError(error instanceof Error ? error.message : 'Failed to update file');
    } finally {
      setIsRenamingFile(false);
    }
  };

  const deleteFolder = async (folderId: string): Promise<void> => {
    try {
      setIsDeletingFolder(true);
      setError(null);
      
      await deleteFolderService(folderId);
      setFolders(prev => prev.filter(folder => folder.id !== folderId));
      
    } catch (error) {
      console.error('Error deleting folder:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete folder');
    } finally {
      setIsDeletingFolder(false);
    }
  };

  const deleteFile = async (fileId: string): Promise<void> => {
    try {
      setError(null);
      
      await deleteFileService(fileId);
      setFiles(prev => prev.filter(file => file.id !== fileId));
      
    } catch (error) {
      console.error('Error deleting file:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete file');
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
    if (session?.user?.id) {
      fetchFolders(currentFolderId);
      fetchFiles(currentFolderId);
    }
  }, [currentFolderId, session?.user?.id]);

  const navigateToFolder = (folderId: string, folderName: string): void => {
    setCurrentFolderId(folderId);
    setFolderPath([...folderPath, { id: folderId, name: folderName }]);
  };

  const navigateBack = (): void => {
    if (folderPath.length > 0) {
      const newPath = [...folderPath];
      newPath.pop();
      setFolderPath(newPath);
      setCurrentFolderId(newPath.length > 0 ? newPath[newPath.length - 1].id : null);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const uploadedFiles = Array.from(event.target.files);
    await uploadFiles(uploadedFiles);
    
    event.target.value = '';
  };

  const deleteItem = async (id: string, type: 'folder' | 'file'): Promise<void> => {
    if (type === 'folder') {
      await deleteFolder(id);
    } else {
      await deleteFile(id);
    }
    setContextMenu(null);
  };

  const startRename = (item: FolderType | FileType, type: 'folder' | 'file'): void => {
    setEditingItem({ ...item, type } as EditingItemType);
    setEditName(item.name);
    setContextMenu(null);
  };

  const saveRename = async (): Promise<void> => {
    if (!editName.trim() || !editingItem) return;
    
    if (editingItem.type === 'folder') {
      await updateFolder(editingItem.id, editName);
    } else {
      await updateFile(editingItem.id, editName);
    }
    
    setEditingItem(null);
    setEditName('');
  };

  const cancelRename = (): void => {
    setEditingItem(null);
    setEditName('');
  };

  const handleContextMenu = (e: React.MouseEvent, item: FolderType | FileType, type: 'folder' | 'file'): void => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, item, type });
  };

  const handleMenuButtonClick = (e: React.MouseEvent, item: FolderType | FileType, type: 'folder' | 'file'): void => {
    e.stopPropagation();
    console.log('item', item, 'type', type);
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({ 
      x: rect.right, 
      y: rect.top, 
      item, 
      type 
    });
  };

  const handleRenameKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      saveRename();
    } else if (e.key === 'Escape') {
      cancelRename();
    }
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
    setContextMenu(null); 
  };

   const handleFilePreview = (file: FileType) => {
    setPreviewFile(file);
    setIsPreviewOpen(true);
    setContextMenu(null);
  };

   const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewFile(null);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">

        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
              >
                Dismiss
              </button>
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
            onNavigateHome={() => {
              setCurrentFolderId(null);
              setFolderPath([]);
            }}
            onNavigateToFolder={(folderId, newPath) => {
              setCurrentFolderId(folderId);
              setFolderPath(newPath);
            }}
          />

          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => setIsCreateFolderOpen(true)}
              disabled={isCreatingFolder}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
            >
              {isCreatingFolder ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FolderPlus className="w-4 h-4 mr-2" />
              )}
              New Folder
            </button>
            
            <label className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload Files'}
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>
            
            {folderPath.length > 0 && (
              <button
                onClick={navigateBack}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
              <span className="text-gray-600">Loading folders...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {folders.map((folder) => (
                <FolderComponent
                  key={folder.id}
                  folder={folder}
                  onDoubleClick={navigateToFolder}
                  onContextMenu={handleContextMenu}
                  onMenuButtonClick={handleMenuButtonClick}
                  editingItem={editingItem as EditingItem | null}
                  editName={editName}
                  setEditName={setEditName}
                  onSaveRename={saveRename}
                  onRenameKeyPress={handleRenameKeyPress}
                  isRenamingFolder={isRenamingFolder}
                  isDeletingFolder={isDeletingFolder}
                />
              ))}

              {files.map((file) => (
                <FileComponent
                  key={file.id}
                  file={file}
                  onContextMenu={handleContextMenu}
                  onMenuButtonClick={handleMenuButtonClick}
                  editingItem={editingItem as EditingFile | null}
                  editName={editName}
                  setEditName={setEditName}
                  onSaveRename={saveRename}
                  onRenameKeyPress={handleRenameKeyPress}
                  isRenamingFile={isRenamingFile}
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

      {contextMenu && (
        <ContextMenuComponent
          contextMenu={contextMenu}
          contextMenuRef={contextMenuRef}
          onStartRename={startRename}
          onFilePreview={handleFilePreview}
          onFileDownload={handleFileDownload}
          onDeleteItem={deleteItem}
          isRenamingFolder={isRenamingFolder}
          isDeletingFolder={isDeletingFolder}
        />
      )}

      <FilePreviewModal
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        file={previewFile}
        onDownload={handleFileDownload}
      />
    </div>
  );
}
'use client';
import React, { useState, useEffect, JSX } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { 
  Upload, 
  LogOut, 
  User, 
  Files, 
  Settings, 
  Home,
  Folder,
  FolderPlus,
  ArrowLeft,
  MoreVertical,
  Trash2,
  Edit,
  Download,
  Eye,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Loader2
} from 'lucide-react';

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
  originalName:string
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

export default function DriveCloneUI(): JSX.Element {
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
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<ContextMenuData | null>(null);
  const [editingItem, setEditingItem] = useState<EditingItemType>(null);
  const [editName, setEditName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isRenamingFolder, setIsRenamingFolder] = useState<boolean>(false);
  const [isDeletingFolder, setIsDeletingFolder] = useState<boolean>(false);
  const [isRenamingFile, setIsRenamingFile] = useState<boolean>(false);
  const [isDeletingFile, setIsDeletingFile] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  const handleSignOut = async (): Promise<void> => {
    await signOut({ callbackUrl: '/login' });
  };

  const fetchFolders = async (parentId: string | null = null): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/folders?parentId=${parentId || 'null'}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch folders');
      }
      
      setFolders(data.data || []);
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
      
      const response = await fetch(`/api/files?folderId=${folderId || 'null'}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch files');
      }
      
      setFiles(data.data || []);
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
      
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newFolderName.trim(),
          parentId: currentFolderId,
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create folder');
      }
      
      setFolders(prev => [data.data, ...prev]);
      
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
      
      const response = await fetch(`/api/folders?id=${folderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newName.trim(),
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update folder');
      }
      
      // Update the folder in the local state
      setFolders(prev => prev.map(folder => 
        folder.id === folderId 
          ? { ...folder, name: newName.trim(), updatedAt: new Date().toISOString() }
          : folder
      ));
      
      // Update folder path if the renamed folder is in the current path
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
      
      const response = await fetch(`/api/files?id=${fileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newName.trim(),
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update file');
      }
      
      // Update the file in the local state
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
      
      const response = await fetch(`/api/folders?id=${folderId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete folder');
      }
      
      // Remove the folder from the local state
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
      setIsDeletingFile(true);
      setError(null);
      
      const response = await fetch(`/api/files?id=${fileId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete file');
      }
      
      setFiles(prev => prev.filter(file => file.id !== fileId));
      
    } catch (error) {
      console.error('Error deleting file:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete file');
    } finally {
      setIsDeletingFile(false);
    }
  };

  const uploadToCloudinary = async (file: File): Promise<{ url: string; publicId: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'your_upload_preset');
    console.log('process.env.CLOUDINARY_CLOUD_NAME',process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload to Cloudinary');
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  };

  const uploadFiles = async (uploadedFiles: File[]): Promise<void> => {
    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress('Starting upload...');

      const uploadedFileData: FileType[] = [];

      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        setUploadProgress(`Uploading ${file.name} (${i + 1}/${uploadedFiles.length})...`);

        try {
          const { url, publicId } = await uploadToCloudinary(file);

          const response = await fetch('/api/files', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: file.name,
              originalName: file.name,
              type: file.type,
              size: file.size.toString(),
              folderId: currentFolderId,
              url: url,
              cloudinaryPublicId: publicId,
            }),
          });

          const data = await response.json();

          if (!data.success) {
            throw new Error(data.error || `Failed to save ${file.name}`);
          }

          uploadedFileData.push(data.data);
        } catch (fileError) {
          console.error(`Error uploading ${file.name}:`, fileError);
          setError(`Failed to upload ${file.name}: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`);
        }
      }

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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string): JSX.Element => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5 text-green-600" />;
    if (type.startsWith('video/')) return <Video className="w-5 h-5 text-red-600" />;
    if (type.startsWith('audio/')) return <Music className="w-5 h-5 text-purple-600" />;
    if (type === 'application/pdf') return <FileText className="w-5 h-5 text-red-600" />;
    if (type.includes('zip') || type.includes('rar')) return <Archive className="w-5 h-5 text-yellow-600" />;
    return <FileText className="w-5 h-5 text-blue-600" />;
  };

  const handleContextMenu = (e: React.MouseEvent, item: FolderType | FileType, type: 'folder' | 'file'): void => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, item, type });
  };

  const handleMenuButtonClick = (e: React.MouseEvent, item: FolderType | FileType, type: 'folder' | 'file'): void => {
    e.stopPropagation();
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

  const handleFileDownload = async (file: FileType): Promise<void> => {
    try {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.originalName || file.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      setError('Failed to download file');
    }
    setContextMenu(null);
  };

  const handleFilePreview = (file: FileType): void => {
    window.open(file.url, '_blank');
    setContextMenu(null);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg mr-3">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">DriveClone</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-700">
                  {session?.user?.name || session?.user?.email || 'Demo User'}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

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

          <div className="flex items-center mb-6">
            <button
              onClick={() => {
                setCurrentFolderId(null);
                setFolderPath([]);
              }}
              className="flex items-center text-blue-600 hover:text-blue-800 mr-2"
            >
              <Home className="w-4 h-4 mr-1" />
              Home
            </button>
            {folderPath.map((folder, index) => (
              <React.Fragment key={folder.id}>
                <span className="mx-2 text-gray-400">/</span>
                <button
                  onClick={() => {
                    const newPath = folderPath.slice(0, index + 1);
                    setFolderPath(newPath);
                    setCurrentFolderId(folder.id);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {folder.name}
                </button>
              </React.Fragment>
            ))}
          </div>

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
                <div
                  key={folder.id}
                  className="relative group bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onDoubleClick={() => navigateToFolder(folder.id, folder.name)}
                  onContextMenu={(e) => handleContextMenu(e, folder, 'folder')}
                >
                  {editingItem?.id === folder.id ? (
                    <div className="flex items-center">
                      <Folder className="w-8 h-8 text-blue-600 mr-3 flex-shrink-0" />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onBlur={saveRename}
                          onKeyDown={handleRenameKeyPress}
                          className="w-full text-sm font-medium text-gray-900 bg-gray-50 border border-gray-300 rounded px-2 py-1"
                          autoFocus
                          disabled={isRenamingFolder}
                        />
                        {isRenamingFolder && (
                          <div className="flex items-center mt-1">
                            <Loader2 className="w-3 h-3 animate-spin text-blue-600 mr-1" />
                            <span className="text-xs text-gray-500">Renaming...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center">
                        <Folder className="w-8 h-8 text-blue-600 mr-3 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{folder.name}</p>
                          <p className="text-xs text-gray-500">
                            Created: {new Date(folder.createdAt).toLocaleDateString()}
                          </p>
                          {folder.updatedAt && folder.updatedAt !== folder.createdAt && (
                            <p className="text-xs text-gray-500">
                              Updated: {new Date(folder.updatedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleMenuButtonClick(e, folder, 'folder')}
                        className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={isDeletingFolder}
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                    </>
                  )}
                </div>
              ))}

              {files.map((file) => (
                <div
                  key={file.id}
                  className="relative group bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                  onContextMenu={(e) => handleContextMenu(e, file, 'file')}
                >
                  {editingItem?.id === file.id ? (
                    <div className="flex items-center">
                      {getFileIcon(file.type)}
                      <div className="ml-3 flex-1">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onBlur={saveRename}
                          onKeyDown={handleRenameKeyPress}
                          className="w-full text-sm font-medium text-gray-900 bg-gray-50 border border-gray-300 rounded px-2 py-1"
                          autoFocus
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center">
                        {getFileIcon(file.type)}
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          <p className="text-xs text-gray-500">Created: {file.createdAt}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleMenuButtonClick(e, file, 'file')}
                        className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                    </>
                  )}
                </div>
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

      {isCreateFolderOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Folder</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={handleFolderNameKeyPress}
              autoFocus
            />
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setIsCreateFolderOpen(false);
                  setNewFolderName('');
                }}
                disabled={isCreatingFolder}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={createFolder}
                disabled={isCreatingFolder || !newFolderName.trim()}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
              >
                {isCreatingFolder && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {contextMenu && (
        <div
          className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseLeave={() => setContextMenu(null)}
        >
          <button
            onClick={() => startRename(contextMenu.item, contextMenu.type)}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            disabled={isRenamingFolder && contextMenu.type === 'folder'}
          >
            <Edit className="w-4 h-4 mr-2" />
            Rename
          </button>
          {contextMenu.type === 'file' && (
            <>
              <button
                onClick={() => handleFilePreview(contextMenu.item as FileType)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </button>
              <button
                onClick={() => handleFileDownload(contextMenu.item as FileType)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
            </>
          )}
          <button
            onClick={() => deleteItem(contextMenu.item.id, contextMenu.type)}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
            disabled={isDeletingFolder && contextMenu.type === 'folder'}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isDeletingFolder && contextMenu.type === 'folder' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
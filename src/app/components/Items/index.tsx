'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Folder,
  Edit,
  Eye,
  Download,
  Trash2,
  Loader2,
} from 'lucide-react';
import Input from '../Input';

interface BaseItem {
  id: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
}

interface FolderType extends BaseItem {
  parentId: string | null;
  path?: string[];
  fileCount?: number;
}

interface FileType extends BaseItem {
  type: string;
  size: number;
  folderId: string | null;
  url: string;
  originalName: string;
  cloudinaryPublicId?: string;
}

interface EditingItem extends BaseItem {
  type: 'folder' | 'file';
}

interface ItemComponentProps {
  item: FolderType | FileType;
  itemType: 'folder' | 'file';
  onDoubleClick?: (folderId: string, folderName: string) => void;
  onFilePreview?: (file: FileType) => void;
  onFileDownload?: (file: FileType) => void;
  onDelete: (id: string, type: 'folder' | 'file') => Promise<void>;
  onRename: (id: string, newName: string, type: 'folder' | 'file') => Promise<void>;
  editingItem?: EditingItem | null;
  isRenaming?: boolean;
  isDeleting?: boolean;
}

const Item: React.FC<ItemComponentProps> = ({
  item,
  itemType,
  onDoubleClick,
  onFilePreview,
  onFileDownload,
  onDelete,
  onRename,
  editingItem,
  isRenaming = false,
  isDeleting = false,
}) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [editName, setEditName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const isCurrentlyEditing = editingItem?.id === item.id && isEditing;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        setShowContextMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string): React.JSX.Element => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5 text-green-600" />;
    if (type.startsWith('video/')) return <Video className="w-5 h-5 text-red-600" />;
    if (type.startsWith('audio/')) return <Music className="w-5 h-5 text-purple-600" />;
    if (type === 'application/pdf') return <FileText className="w-5 h-5 text-red-600" />;
    if (type.includes('zip') || type.includes('rar')) return <Archive className="w-5 h-5 text-yellow-600" />;
    return <FileText className="w-5 h-5 text-blue-600" />;
  };

  const getIcon = () => {
    return itemType === 'folder'
      ? <Folder className="w-8 h-8 text-blue-600 mr-3 flex-shrink-0" />
      : <div className="mr-3 flex-shrink-0">{getFileIcon((item as FileType).type)}</div>;
  };

  const handleDoubleClick = () => {
    if (itemType === 'folder' && onDoubleClick) {
      onDoubleClick(item.id, item.name);
    }
  };

  const startRename = () => {
    setIsEditing(true);
    setEditName(item.name);
    setShowContextMenu(false);
  };

  const saveRename = async () => {
    if (editName.trim() && editName !== item.name) {
      await onRename(item.id, editName.trim(), itemType);
    }
    setIsEditing(false);
    setEditName('');
  };

  const cancelRename = () => {
    setIsEditing(false);
    setEditName('');
  };

  const handleRenameKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') saveRename();
    else if (e.key === 'Escape') cancelRename();
  };

  const handleDelete = async () => {
    await onDelete(item.id, itemType);
    setShowContextMenu(false);
  };

  const handleFilePreview = () => {
    if (itemType === 'file' && onFilePreview) {
      onFilePreview(item as FileType);
    }
    setShowContextMenu(false);
  };

  const handleFileDownload = () => {
    if (itemType === 'file' && onFileDownload) {
      onFileDownload(item as FileType);
    }
    setShowContextMenu(false);
  };

  const renderItemDetails = () => {
    if (itemType === 'folder') {
      return (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
          <p className="text-xs text-gray-500">Created: {new Date(item.createdAt).toLocaleDateString()}</p>
          {item.updatedAt && item.updatedAt !== item.createdAt && (
            <p className="text-xs text-gray-500">Updated: {new Date(item.updatedAt).toLocaleDateString()}</p>
          )}
        </div>
      );
    } else {
      const file = item as FileType;
      return (
        <div className="ml-3 flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
          <p className="text-xs text-gray-500">Created: {new Date(file.createdAt).toLocaleDateString()}</p>
        </div>
      );
    }
  };

  return (
    <div
      className={`relative group bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200  ${
        itemType === 'folder' ? 'cursor-pointer' : ''
      }`}
      onDoubleClick={handleDoubleClick}
    >
      {isCurrentlyEditing ? (
        <div className="flex items-center">
          {getIcon()}
          <div className="flex-1">
            <Input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              autoFocus
              onBlur={saveRename}
              onKeyDown={handleRenameKeyPress}
              disabled={isRenaming}
              className="text-sm"
            />
            {isRenaming && (
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
            {getIcon()}
            {renderItemDetails()}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowContextMenu((prev) => !prev);
            }}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
            disabled={isDeleting}
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>

          {showContextMenu && (
            <div
              ref={contextMenuRef}
              className="absolute top-10 right-2 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50 min-w-[140px]"
            >
              <button
                onClick={startRename}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                disabled={isRenaming}
              >
                <Edit className="w-4 h-4 mr-2" /> Rename
              </button>

              {itemType === 'file' && (
                <>
                  <button
                    onClick={handleFilePreview}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-2" /> Preview
                  </button>
                  <button
                    onClick={handleFileDownload}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" /> Download
                  </button>
                </>
              )}

              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Item;

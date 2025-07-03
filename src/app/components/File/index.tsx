'use client';

import React from 'react';
import { 
  MoreVertical, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive 
} from 'lucide-react';

interface FileType {
  id: string;
  name: string;
  type: string;
  size: number;
  folderId: string | null;
  url: string;
  createdAt: string;
  originalName: string;
}

interface EditingFile extends FileType {
  type: 'file';
}

interface FileComponentProps {
  file: FileType;
  onContextMenu: (e: React.MouseEvent, file: FileType, type: 'file') => void;
  onMenuButtonClick: (e: React.MouseEvent, file: FileType, type: 'file') => void;
  editingItem: EditingFile | null;
  editName: string;
  setEditName: (name: string) => void;
  onSaveRename: () => Promise<void>;
  onRenameKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isRenamingFile: boolean;
}

const FileComponent: React.FC<FileComponentProps> = ({
  file,
  onContextMenu,
  onMenuButtonClick,
  editingItem,
  editName,
  setEditName,
  onSaveRename,
  onRenameKeyPress,
  isRenamingFile,
}) => {
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

  return (
    <div
      className="relative group bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
      onContextMenu={(e) => onContextMenu(e, file, 'file')}
    >
      {editingItem?.id === file.id ? (
        <div className="flex items-center">
          {getFileIcon(file.type)}
          <div className="ml-3 flex-1">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={onSaveRename}
              onKeyDown={onRenameKeyPress}
              className="w-full text-sm font-medium text-gray-900 bg-gray-50 border border-gray-300 rounded px-2 py-1"
              autoFocus
              disabled={isRenamingFile}
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
            onClick={(e) => onMenuButtonClick(e, file, 'file')}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
        </>
      )}
    </div>
  );
};

export default FileComponent;
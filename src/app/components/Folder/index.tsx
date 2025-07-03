'use client';

import React from 'react';
import { Folder, MoreVertical, Loader2 } from 'lucide-react';

interface FolderType {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt?: string;
  path?: string[];
}

interface EditingItem extends FolderType {
  type: 'folder';
}

interface FolderComponentProps {
  folder: FolderType;
  onDoubleClick: (folderId: string, folderName: string) => void;
  onContextMenu: (e: React.MouseEvent, folder: FolderType, type: 'folder') => void;
  onMenuButtonClick: (e: React.MouseEvent, folder: FolderType, type: 'folder') => void;
  editingItem: EditingItem | null;
  editName: string;
  setEditName: (name: string) => void;
  onSaveRename: () => Promise<void>;
  onRenameKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isRenamingFolder: boolean;
  isDeletingFolder: boolean;
}

const FolderComponent: React.FC<FolderComponentProps> = ({
  folder,
  onDoubleClick,
  onContextMenu,
  onMenuButtonClick,
  editingItem,
  editName,
  setEditName,
  onSaveRename,
  onRenameKeyPress,
  isRenamingFolder,
  isDeletingFolder,
}) => {
  return (
    <div
      className="relative group bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onDoubleClick={() => onDoubleClick(folder.id, folder.name)}
      onContextMenu={(e) => onContextMenu(e, folder, 'folder')}
    >
      {editingItem?.id === folder.id ? (
        <div className="flex items-center">
          <Folder className="w-8 h-8 text-blue-600 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={onSaveRename}
              onKeyDown={onRenameKeyPress}
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
            onClick={(e) => onMenuButtonClick(e, folder, 'folder')}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
            disabled={isDeletingFolder}
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
        </>
      )}
    </div>
  );
};

export default FolderComponent;
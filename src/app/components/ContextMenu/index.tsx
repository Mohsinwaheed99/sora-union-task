'use client';
import React from 'react';
import { Edit, Eye, Download, Trash2, Loader2 } from 'lucide-react';
import FilePreviewModal from '../FilePreview';

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
}

interface ContextMenuData {
  x: number;
  y: number;
  item: FolderType | FileType;
  type: 'folder' | 'file';
}

interface ContextMenuComponentProps {
  contextMenu: ContextMenuData;
  contextMenuRef: React.RefObject<HTMLDivElement | null>;
  onStartRename: (item: FolderType | FileType, type: 'folder' | 'file') => void;
  onFilePreview: (file: FileType) => void;
  onFileDownload: (file: FileType) => void;
  onDeleteItem: (id: string, type: 'folder' | 'file') => Promise<void>;
  isRenamingFolder: boolean;
  isDeletingFolder: boolean;
}

const ContextMenuComponent: React.FC<ContextMenuComponentProps> = ({
  contextMenu,
  contextMenuRef,
  onStartRename,
  onFilePreview,
  onFileDownload,
  onDeleteItem,
  isRenamingFolder,
  isDeletingFolder,
}) => {
  console.log('contextMenu',contextMenu)
  return (
    <div
      ref={contextMenuRef}
      className="absolute bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50"
      style={{
        left: contextMenu.x,
        top: contextMenu.y,
      }}
    >
      <button
        onClick={() => onStartRename(contextMenu.item, contextMenu.type)}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
        disabled={isRenamingFolder && contextMenu.type === 'folder'}
      >
        <Edit className="w-4 h-4 mr-2" />
        Rename
      </button>
      {contextMenu.type === 'file' && (
        <>
          <button
            onClick={() => onFilePreview(contextMenu.item as FileType)}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </button>
          <button
            onClick={() => onFileDownload(contextMenu.item as FileType)}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </button>
        </>
      )}
      <button
        onClick={() => onDeleteItem(contextMenu.item.id, contextMenu.type)}
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
  );
};

export default ContextMenuComponent;
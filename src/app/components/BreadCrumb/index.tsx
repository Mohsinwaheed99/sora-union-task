'use client';

import React from 'react';
import { Home } from 'lucide-react';

interface FolderType {
  id: string;
  name: string;
}

interface BreadcrumbsProps {
  folderPath: FolderType[];
  onNavigateHome: () => void;
  onNavigateToFolder: (folderId: string, newPath: FolderType[]) => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  folderPath,
  onNavigateHome,
  onNavigateToFolder,
}) => {
  return (
    <div className="flex items-center mb-6">
      <button
        onClick={onNavigateHome}
        className="flex items-center text-blue-600 hover:text-blue-800 mr-2"
      >
        <Home className="w-4 h-4 mr-1" />
        Home
      </button>

      {folderPath.map((folder, index) => (
        <React.Fragment key={folder.id}>
          <span className="mx-2 text-gray-400">/</span>
          <button
            onClick={() =>
              onNavigateToFolder(folder.id, folderPath.slice(0, index + 1))
            }
            className="text-blue-600 hover:text-blue-800"
          >
            {folder.name}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumbs;

// Update your Breadcrumbs component (BreadCrumb.tsx or similar)

import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface PathItem {
  id: string;
  name: string;
}

interface BreadcrumbsProps {
  folderPath: PathItem[];
  onNavigateHome: () => void;
  onNavigateToFolder: (folderId: string | null, index: number) => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  folderPath,
  onNavigateHome,
  onNavigateToFolder,
}) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
      <button
        onClick={onNavigateHome}
        className="flex items-center hover:text-blue-600 transition-colors"
      >
        <Home className="w-4 h-4 mr-1" />
        Home
      </button>
      
      {folderPath.map((pathItem, index) => {
        const isLast = index === folderPath.length - 1;
        return (
          <React.Fragment key={pathItem.id}>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <button
              onClick={() => onNavigateToFolder(pathItem.id, index)}
              className={`transition-colors truncate max-w-32 ${
                isLast 
                  ? 'text-gray-900 font-medium cursor-default' 
                  : 'hover:text-blue-600'
              }`}
              title={pathItem.name}
              disabled={isLast} // Disable click on current folder
            >
              {pathItem.name}
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
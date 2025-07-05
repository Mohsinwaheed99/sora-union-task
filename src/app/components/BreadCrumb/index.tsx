import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import Button from '../Button';

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
      <Button
        type="button"
        variant="outline"
        size="md"
        className="flex items-center hover:text-blue-600 transition-colors cursor-pointer"
        onClick={onNavigateHome}
      >
        <Home className="w-4 h-4 mr-1" />
        Home
      </Button>

      {folderPath.map((pathItem, index) => {
        const isLast = index === folderPath.length - 1;

        return (
          <React.Fragment key={pathItem.id}>
            <ChevronRight className="w-4 h-4 text-gray-400" />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onNavigateToFolder(pathItem.id, index)}
              disabled={isLast}
              className={`truncate max-w-32 px-1 py-0 h-auto text-sm ${
                isLast
                  ? 'text-gray-900 font-medium cursor-default'
                  : 'text-gray-500 hover:text-blue-600'
              }`}
            >
              {pathItem.name}
            </Button>
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;

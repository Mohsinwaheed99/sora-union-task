'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import Modal from '../Modal';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  onCreateFolder: () => Promise<void>;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isCreatingFolder: boolean;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  newFolderName,
  setNewFolderName,
  onCreateFolder,
  onKeyPress,
  isCreatingFolder,
}) => {
  const handleClose = () => {
    onClose();
    setNewFolderName('');
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} modalWidth={500}>
      <div className="mt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Folder</h3>
        <input
          type="text"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="Folder name"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onKeyPress={onKeyPress}
          autoFocus
        />
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleClose}
            disabled={isCreatingFolder}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onCreateFolder}
            disabled={isCreatingFolder || !newFolderName.trim()}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
          >
            {isCreatingFolder && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateFolderModal;
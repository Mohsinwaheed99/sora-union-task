'use client';

import React from 'react';
import Modal from '../Modal';
import Input from '../Input';
import Button from '../Button';

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
        <Input
          type="text"
          id="name"
          placeholder="Folder name"
          required
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          onKeyDown={onKeyPress}
          autoFocus
        />
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            onClick={handleClose}
            variant="outline"
            size="md"
            disabled={isCreatingFolder}
          >
            Cancel
          </Button>
          <Button
            onClick={onCreateFolder}
            variant="primary"
            size="md"
            isLoading={isCreatingFolder}
            disabled={!newFolderName.trim()}
            loadingText="Creating..."
          >
            Create
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateFolderModal;

import axios from './axios';

interface FolderType {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt?: string;
  path?: string[];
}

export const createFolder = async (name: string, parentId: string | null): Promise<FolderType> => {
  const { data } = await axios.post('/folders', { name, parentId });
  return data.data;
};

export const deleteFolder = async (folderId: string): Promise<void> => {
  const { data } = await axios.delete(`/folders?id=${folderId}`);
  return data.data;
};

export const renameFolder = async (folderId: string, newName: string): Promise<FolderType> => {
  const { data } = await axios.put(`/folders?id=${folderId}`, { name: newName });
  return data.data;
};

export const fetchFolders = async (parentId: string | null = null): Promise<FolderType[]> => {
  const { data } = await axios.get(`/folders?parentId=${parentId || 'null'}`);
  return data.data;
};

export const getFolderById = async (folderId: string): Promise<FolderType> => {
  const { data } = await axios.get(`/folders/${folderId}`);
  return data.data;
};

export const moveFolder = async (folderId: string, newParentId: string | null): Promise<FolderType> => {
  const { data } = await axios.put(`/folders?id=${folderId}`, { parentId: newParentId });
  return data.data;
};

export const copyFolder = async (folderId: string, newParentId: string | null): Promise<FolderType> => {
  const { data } = await axios.post(`/folders/copy`, { folderId, parentId: newParentId });
  return data.data;
};

export const getFolderPath = async (folderId: string): Promise<{ id: string; name: string }[]> => {
  const { data } = await axios.get(`/folders/${folderId}/path`);
  return data.data;
};


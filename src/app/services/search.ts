import axios from './axios';

interface SearchResult {
  folders: Array<{
    id: string;
    name: string;
    parentId: string | null;
    createdAt: string;
    updatedAt?: string;
    type: 'folder';
  }>;
  files: Array<{
    id: string;
    name: string;
    originalName: string;
    type: string;
    size: number;
    folderId: string | null;
    url: string;
    createdAt: string;
    updatedAt?: string;
    cloudinaryPublicId?: string;
  }>;
}

export const searchFiles = async (query: string): Promise<SearchResult> => {
  if (!query.trim()) {
    return { folders: [], files: [] };
  }

  const { data } = await axios.get('/search', {
    params: {
      q: query.trim()
    }
  });

  return data.data;
};
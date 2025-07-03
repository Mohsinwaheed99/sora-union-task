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

  const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Search failed');
  }

  const data = await response.json();
  return data.data;
};
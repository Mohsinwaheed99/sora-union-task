import axios from './axios';

interface FileType {
  id: string;
  name: string;
  type: string;
  size: number;
  folderId: string | null;
  url: string;
  createdAt: string;
  originalName: string;
  cloudinaryPublicId?: string;
  updatedAt?: string;
}

export const createFile = async (fileData: {
  name: string;
  originalName: string;
  type: string;
  size: string;
  folderId: string | null;
  url: string;
  cloudinaryPublicId?: string;
}): Promise<FileType> => {
  const { data } = await axios.post('/files', fileData);
  return data.data;
};

export const deleteFile = async (fileId: string): Promise<void> => {
  const { data } = await axios.delete(`/files?id=${fileId}`);
  return data.data;
};

export const renameFile = async (fileId: string, newName: string): Promise<FileType> => {
  const { data } = await axios.put(`/files?id=${fileId}`, { name: newName });
  return data.data;
};

export const fetchFiles = async (folderId: string | null = null): Promise<FileType[]> => {
  const { data } = await axios.get(`/files?folderId=${folderId || 'null'}`);
  return data.data;
};

export const getFileById = async (fileId: string): Promise<FileType> => {
  const { data } = await axios.get(`/files/${fileId}`);
  return data.data;
};

export const moveFile = async (fileId: string, newFolderId: string | null): Promise<FileType> => {
  const { data } = await axios.put(`/files?id=${fileId}`, { folderId: newFolderId });
  return data.data;
};

export const copyFile = async (fileId: string, newFolderId: string | null): Promise<FileType> => {
  const { data } = await axios.post(`/files/copy`, { fileId, folderId: newFolderId });
  return data.data;
};

export const uploadToCloudinary = async (file: File): Promise<{ url: string; publicId: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'your_upload_preset');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Failed to upload to Cloudinary');
  }

  const data = await response.json();
  return {
    url: data.secure_url,
    publicId: data.public_id,
  };
};

export const uploadFiles = async (files: File[], folderId: string | null): Promise<FileType[]> => {
  const uploadedFiles: FileType[] = [];

  for (const file of files) {
    try {
      const { url, publicId } = await uploadToCloudinary(file);
      
      const fileData = await createFile({
        name: file.name,
        originalName: file.name,
        type: file.type,
        size: file.size.toString(),
        folderId: folderId,
        url: url,
        cloudinaryPublicId: publicId,
      });

      uploadedFiles.push(fileData);
    } catch (error) {
      console.error(`Error uploading ${file.name}:`, error);
      throw error;
    }
  }

  return uploadedFiles;
};
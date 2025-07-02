import { ObjectId } from 'mongodb';

export interface Folder {
  _id?: ObjectId;
  id?: string;
  name: string;
  parentId: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  path: string[];
}

export interface FileDocument {
  _id?: ObjectId;
  id?: string;
  name: string;
  originalName: string;
  type: string;
  size: number;
  folderId: string | null;
  userId: string;
  url: string;
  cloudinaryPublicId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
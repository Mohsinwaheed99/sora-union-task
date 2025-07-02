import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { getDatabase } from '../../lib/mongodb';
import { ApiResponse } from '../../types/api';
import { authOptions } from '@/app/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const { q } = req.query;

  if (!q || typeof q !== 'string' || q.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Search query is required'
    });
  }

  try {
    const db = await getDatabase();
    const foldersCollection = db.collection('folders');
    const filesCollection = db.collection('files');

    const searchRegex = new RegExp(q.trim(), 'i');

    // Search folders
    const folders = await foldersCollection
      .find({
        userId: session.user.id,
        name: { $regex: searchRegex }
      })
      .limit(20)
      .toArray();

    // Search files
    const files = await filesCollection
      .find({
        userId: session.user.id,
        $or: [
          { name: { $regex: searchRegex } },
          { originalName: { $regex: searchRegex } }
        ]
      })
      .limit(20)
      .toArray();

    const results = {
      folders: folders.map(folder => ({
        ...folder,
        id: folder._id?.toString(),
        _id: undefined,
        type: 'folder'
      })),
      files: files.map(file => ({
        ...file,
        id: file._id?.toString(),
        _id: undefined,
        type: 'file'
      }))
    };

    return res.status(200).json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({
      success: false,
      error: 'Search failed'
    });
  }
}
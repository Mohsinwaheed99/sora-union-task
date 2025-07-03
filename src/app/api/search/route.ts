import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { getDatabase } from '@/app/lib/mongodb';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q || q.trim().length === 0) {
    return NextResponse.json({ success: false, error: 'Search query is required' }, { status: 400 });
  }

  try {
    const db = await getDatabase();
    const foldersCollection = db.collection('folders');
    const filesCollection = db.collection('files');

    const searchRegex = new RegExp(q.trim(), 'i');

    const folders = await foldersCollection.find({
      userId: session.user.id,
      name: { $regex: searchRegex }
    }).limit(20).toArray();

    const files = await filesCollection.find({
      userId: session.user.id,
      $or: [
        { name: { $regex: searchRegex } },
        { originalName: { $regex: searchRegex } }
      ]
    }).limit(20).toArray();

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

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 });
  }
}

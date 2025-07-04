import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getDatabase } from '@/app/lib/mongodb';
import { Folder } from '@/app/types/api';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/app/lib/auth';

interface PathItem {
  id: string;
  name: string;
}

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { id } = params;

  if (!id || typeof id !== 'string') {
    return NextResponse.json(
      { success: false, error: 'Invalid folder ID' },
      { status: 400 }
    );
  }

  try {
    const path = await buildFolderPath(id, session.user.id);
    
    return NextResponse.json({
      success: true,
      path
    });
  } catch (error) {
    console.error('Error getting folder path:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get folder path' },
      { status: 500 }
    );
  }
}

async function buildFolderPath(folderId: string, userId: string): Promise<PathItem[]> {
  const path: PathItem[] = [];
  let currentFolderId: string | null = folderId;

  const db = await getDatabase();
  const foldersCollection = db.collection<Folder>('folders');

  while (currentFolderId) {
    try {
      const folder:any = await foldersCollection.findOne({
        _id: new ObjectId(currentFolderId),
        userId: userId
      });

      if (!folder) break;

      path.unshift({ 
        id: folder._id.toString(), 
        name: folder.name 
      });
      
      currentFolderId = folder.parentId;
    } catch (error) {
      console.error('Database error:', error);
      break;
    }
  }

  return path;
}
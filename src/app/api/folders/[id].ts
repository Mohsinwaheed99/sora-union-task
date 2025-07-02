import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getDatabase } from '@/app/lib/mongodb';
import { Folder, ApiResponse } from '@/app/types/api';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/app/lib/auth';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
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
    const { name } = await req.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Folder name is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const foldersCollection = db.collection<Folder>('folders');

    const folder = await foldersCollection.findOne({
      _id: new ObjectId(id),
      userId: session.user.id
    });

    if (!folder) {
      return NextResponse.json(
        { success: false, error: 'Folder not found' },
        { status: 404 }
      );
    }

    const existingFolder = await foldersCollection.findOne({
      userId: session.user.id,
      parentId: folder.parentId,
      name: name.trim(),
      _id: { $ne: new ObjectId(id) }
    });

    if (existingFolder) {
      return NextResponse.json(
        { success: false, error: 'A folder with this name already exists' },
        { status: 409 }
      );
    }

    const result = await foldersCollection.updateOne(
      { _id: new ObjectId(id), userId: session.user.id },
      {
        $set: {
          name: name.trim(),
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Folder not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Folder updated successfully'
    });
  } catch (error) {
    console.error('Error updating folder:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update folder' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
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
    const db = await getDatabase();
    const foldersCollection = db.collection<Folder>('folders');
    const filesCollection = db.collection('files');

    const hasChildren = await foldersCollection.findOne({
      parentId: id,
      userId: session.user.id
    });

    const hasFiles = await filesCollection.findOne({
      folderId: id,
      userId: session.user.id
    });

    if (hasChildren || hasFiles) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete folder that contains files or subfolders' },
        { status: 400 }
      );
    }

    const result = await foldersCollection.deleteOne({
      _id: new ObjectId(id),
      userId: session.user.id
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Folder not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Folder deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete folder' },
      { status: 500 }
    );
  }
}
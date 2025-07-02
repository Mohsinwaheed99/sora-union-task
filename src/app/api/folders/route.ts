import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/app/lib/auth';
import { ApiResponse, Folder } from '@/app/types/api';
import { getDatabase } from '@/app/lib/mongodb';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get('parentId');
    
    const db = await getDatabase();
    const foldersCollection = db.collection<Folder>('folders');
    
    const folders = await foldersCollection
      .find({
        userId: session.user.id,
        parentId: parentId === 'null' || !parentId ? null : parentId
      })
      .sort({ createdAt: -1 })
      .toArray();

    const foldersWithId = folders.map(folder => ({
      ...folder,
      id: folder._id?.toString(),
      _id: undefined
    }));

    return NextResponse.json({
      success: true,
      data: foldersWithId
    });
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch folders' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { name, parentId } = await req.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Folder name is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const foldersCollection = db.collection<Folder>('folders');

    const existingFolder = await foldersCollection.findOne({
      userId: session.user.id,
      parentId: parentId || null,
      name: name.trim()
    });

    if (existingFolder) {
      return NextResponse.json(
        { success: false, error: 'A folder with this name already exists' },
        { status: 409 }
      );
    }

    let path: string[] = [];
    if (parentId) {
      const parentFolder = await foldersCollection.findOne({
        _id: new ObjectId(parentId),
        userId: session.user.id
      });
      
      if (!parentFolder) {
        return NextResponse.json(
          { success: false, error: 'Parent folder not found' },
          { status: 404 }
        );
      }
      
      path = [...parentFolder.path, parentId];
    }

    const newFolder: Folder = {
      name: name.trim(),
      parentId: parentId || null,
      userId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      path
    };

    const result = await foldersCollection.insertOne(newFolder);
    
    const createdFolder = {
      ...newFolder,
      id: result.insertedId.toString(),
      _id: undefined
    };

    return NextResponse.json(
      {
        success: true,
        data: createdFolder,
        message: 'Folder created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create folder' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Folder ID is required' },
        { status: 400 }
      );
    }

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

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Folder ID is required' },
        { status: 400 }
      );
    }

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
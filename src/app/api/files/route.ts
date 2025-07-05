import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { FileDocument, ApiResponse } from '@/app/types/api';
import { authOptions } from '@/app/lib/auth';
import { getDatabase } from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';

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
    const folderId = searchParams.get('folderId');
    
    const db = await getDatabase();
    const filesCollection = db.collection<FileDocument>('files');
    
    const files = await filesCollection
      .find({
        userId: session.user.id,
        folderId: folderId === 'null' || !folderId ? null : folderId
      })
      .sort({ createdAt: -1 })
      .toArray();

    const filesWithId = files.map(file => ({
      ...file,
      id: file._id?.toString(),
      _id: undefined
    }));

    return NextResponse.json({
      success: true,
      data: filesWithId
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch files' },
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
    const { name, originalName, type, size, folderId, url, cloudinaryPublicId } = await req.json();

    if (!name || !originalName || !type || !size || !url) {
      return NextResponse.json(
        { success: false, error: 'Missing required file information' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const filesCollection = db.collection<FileDocument>('files');

    if (folderId) {
      const foldersCollection = db.collection('folders');
      const folder = await foldersCollection.findOne({
        _id: new ObjectId(folderId),
        userId: session.user.id
      });

      if (!folder) {
        return NextResponse.json(
          { success: false, error: 'Folder not found' },
          { status: 404 }
        );
      }
    }

    const newFile: FileDocument = {
      name,
      originalName,
      type,
      size: parseInt(size),
      folderId: folderId || null,
      userId: session.user.id,
      url,
      cloudinaryPublicId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await filesCollection.insertOne(newFile);
    
    const createdFile = {
      ...newFile,
      id: result.insertedId.toString(),
      _id: undefined
    };

    return NextResponse.json(
      {
        success: true,
        data: createdFile,
        message: 'File uploaded successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating file record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save file information' },
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
        { success: false, error: 'File ID is required' },
        { status: 400 }
      );
    }

    const { name, folderId } = await req.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'File name is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const filesCollection = db.collection<FileDocument>('files');

    const file = await filesCollection.findOne({
      _id: new ObjectId(id),
      userId: session.user.id
    });

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    if (folderId) {
      const foldersCollection = db.collection('folders');
      const folder = await foldersCollection.findOne({
        _id: new ObjectId(folderId),
        userId: session.user.id
      });

      if (!folder) {
        return NextResponse.json(
          { success: false, error: 'Target folder not found' },
          { status: 404 }
        );
      }
    }

    const updateData: Partial<FileDocument> = {
      name: name.trim(),
      updatedAt: new Date()
    };

    if (folderId !== undefined) {
      updateData.folderId = folderId || null;
    }

    const result = await filesCollection.updateOne(
      { _id: new ObjectId(id), userId: session.user.id },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'File updated successfully'
    });
  } catch (error) {
    console.error('Error updating file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update file' },
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
        { success: false, error: 'File ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const filesCollection = db.collection<FileDocument>('files');

    const file = await filesCollection.findOne({
      _id: new ObjectId(id),
      userId: session.user.id
    });

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    const result = await filesCollection.deleteOne({
      _id: new ObjectId(id),
      userId: session.user.id
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
      data: { cloudinaryPublicId: file.cloudinaryPublicId }
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
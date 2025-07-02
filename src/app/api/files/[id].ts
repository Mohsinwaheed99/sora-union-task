import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getDatabase } from '@/app/lib/mongodb';
import { FileDocument, ApiResponse } from '@/app/types/api';
import { ObjectId } from 'mongodb';
import { v2 as cloudinary } from 'cloudinary';
import { authOptions } from '@/app/lib/auth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
      { success: false, error: 'Invalid file ID' },
      { status: 400 }
    );
  }

  try {
    const { name, folderId } = await req.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'File name is required' },
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

    const result = await filesCollection.updateOne(
      { _id: new ObjectId(id), userId: session.user.id },
      {
        $set: {
          name: name.trim(),
          folderId: folderId || null,
          updatedAt: new Date()
        }
      }
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
      { success: false, error: 'Invalid file ID' },
      { status: 400 }
    );
  }

  try {
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

    if (file.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(file.cloudinaryPublicId);
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
      }
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
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
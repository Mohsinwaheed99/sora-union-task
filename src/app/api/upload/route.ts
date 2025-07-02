import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { v2 as cloudinary } from 'cloudinary';
import { IncomingForm, File } from 'formidable';
import { promises as fs } from 'fs';
import { authOptions } from '@/app/lib/auth';

if (process.env.CLOUDINARY_URL) {
  cloudinary.config(process.env.CLOUDINARY_URL);
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const form = new IncomingForm({
      maxTotalFileSize: 50 * 1024 * 1024, 
      maxFileSize: 50 * 1024 * 1024,
    });

    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileContent = await fs.readFile(file.filepath);
    const base64String = fileContent.toString('base64');
    const dataUri = `data:${file.mimetype};base64,${base64String}`;

    const uploadResponse = await cloudinary.uploader.upload(dataUri, {
      folder: `driveClone/${session.user.id}`,
      resource_type: 'auto',
      use_filename: true,
      unique_filename: true,
    });

    await fs.unlink(file.filepath);

    return res.status(200).json({
      success: true,
      data: {
        url: uploadResponse.secure_url,
        publicId: uploadResponse.public_id,
        originalName: file.originalFilename,
        size: file.size,
        type: file.mimetype,
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to upload file'
    });
  }
}
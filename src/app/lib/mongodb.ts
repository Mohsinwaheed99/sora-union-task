import mongoose from 'mongoose';

const uri = process.env.MONGO_URI!;

const options = {
  bufferCommands: false,
};

let client: typeof mongoose;
let clientPromise: Promise<typeof mongoose>;

if (process.env.NODE_ENV === 'development') {
  let globalWithMongoose = global as typeof globalThis & {
    _mongooseClientPromise?: Promise<typeof mongoose>;
  };

  if (!globalWithMongoose._mongooseClientPromise) {
    globalWithMongoose._mongooseClientPromise = mongoose.connect(uri, options);
  }
  clientPromise = globalWithMongoose._mongooseClientPromise;
} else {
  clientPromise = mongoose.connect(uri, options);
}

export { clientPromise };

export async function connectDB(): Promise<typeof mongoose> {
  const client = await clientPromise;
  return client;
}

export async function getDatabase(dbName: string = 'driveClone') {
  const client = await clientPromise;
  return client.connection.db || client.connection.useDb(dbName);
}
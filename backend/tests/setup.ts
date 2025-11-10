import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { UserModel } from '../src/models/user.model';

process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/test-db-placeholder';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-which-is-long-enough-123456';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-which-is-long-enough-123456';
process.env.PORT = '0';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    binary: { version: '7.0.5' }
  });
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);
  await UserModel.createAdminSeed();
});

beforeEach(async () => {
  const collections = await mongoose.connection.db?.collections();
  if (!collections) {
    return;
  }

  await Promise.all(collections.map((collection) => collection.deleteMany({})));
  await UserModel.createAdminSeed();
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

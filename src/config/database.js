import { MongoClient } from 'mongodb';

const DATABASE = 'x19fp';

const db = {};

const connectToDatabase = async () => {
  try {
    const mongoClient = new MongoClient(process.env.MONGO_URI);
    await mongoClient.connect();

    console.log('Database connected successfully');
    const database = mongoClient.db(DATABASE);

    // Collections
    db.collections = database.collection('collections');
    db.users = database.collection('users');
    db.tests = database.collection('tests');
    db.questions = database.collection('questions');
    db.records = database.collection('records');
    db.groups = database.collection('groups');
    db.quizRooms = database.collection('quiz-room');
  } catch (error) {
    console.error('Connect to DB failed:', error);
    process.exit(1);
  }
};

export { connectToDatabase, db };

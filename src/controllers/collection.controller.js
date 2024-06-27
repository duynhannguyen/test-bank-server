import asyncHandler from 'express-async-handler';
import { ObjectId } from 'mongodb';
import { db } from '../config/database.js';

const create = asyncHandler(async (req, res) => {
  const user = req.user;
  const { name } = req.body;

  const newCollection = {
    _id: new ObjectId(),
    userId: user.id,
    name,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await db.collections.insertOne(newCollection);

  res.status(201).json({ id: newCollection._id });
});

const getMyCollections = asyncHandler(async (req, res) => {
  const user = req.user;

  const collections = await db.collections.find({ userId: user.id }).toArray();

  res.json({ data: collections });
});


const CollectionController = {
  create,
  getMyCollections,
};

export default CollectionController;

import asyncHandler from 'express-async-handler';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import { db } from '../config/database.js';

const create = asyncHandler(async (req, res) => {
  const user = req.user;

  const initialAnswers = Array.from({ length: 4 }, () => ({
    id: uuidv4(),
    content: '',
    isCorrect: false
  }));

  const newMultipleChoiceQuestion = {
    _id: new ObjectId(),
    userId: user.id,
    type: 'multiple-choice',
    topic: '',
    answers: initialAnswers,
    subject: null,
    collection: null,
    isPrivate: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await db.questions.insertOne(newMultipleChoiceQuestion);

  const newTest = {
    _id: new ObjectId(),
    userId: user.id,
    title: '',
    description: '',
    subject: null,
    grade: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    questions: [{ id: newMultipleChoiceQuestion._id, score: null }],
    isActived: false
  };

  await db.tests.insertOne(newTest);

  res.status(201).json({ id: newTest._id });
});

const getTestById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingTest = await db.tests.findOne({ _id: new ObjectId(id) });
  if (!existingTest) {
    res.status(400);
    throw new Error('Không tìm thấy bài thi/kiểm tra');
  }

  const ObjectIdArray = existingTest.questions.map(question => new ObjectId(question.id));

  // Tạo đối tượng idMap
  const idMap = {};
  ObjectIdArray.forEach((id, index) => {
    idMap[id.toString()] = index;
  });

  // Lấy các câu hỏi từ cơ sở dữ liệu và duy trì thứ tự
  let questions = await Promise.all(ObjectIdArray.map(id => db.questions.findOne({ _id: id })));

  // Sắp xếp lại mảng questions theo thứ tự của ObjectIdArray
  questions.sort((a, b) => idMap[a._id.toString()] - idMap[b._id.toString()]);

  // Gán điểm số từ existingTest.questions vào questions
  questions = questions.map((question, index) => ({
    ...question,
    score: existingTest.questions[index].score
  }));

  const testContent = { ...existingTest, questions };

  res.json({ data: testContent });
});

const getTestOverviewById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingTest = await db.tests.findOne({ _id: new ObjectId(id) });
  if (!existingTest) {
    res.status(400);
    throw new Error('Không tìm thấy bài thi/kiểm tra');
  }

  const test = await db.tests.findOne({ _id: new ObjectId(id) });
  const { questions, passWord, ...testOverview } = test;

  const user = await db.users.findOne({ _id: new ObjectId(test.userId) });

  res.json({ data: { ...testOverview, user } });
});

const updateTest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  const user = req.user;

  const { _id, userId, createdAt, ...rest } = payload;

  if (user.id !== userId) {
    res.status(400);
    throw new Error('Người dùng không hợp lệ');
  }

  if (_id !== id) {
    res.status(400);
    throw new Error('Dữ liệu gửi lên không hợp lệ');
  }

  const existingTest = await db.tests.findOne({ _id: new ObjectId(id) });
  if (!existingTest) {
    res.status(400);
    throw new Error('Không tìm thấy bài thi/kiểm tra');
  }

  const updatedFields = { ...existingTest, ...rest, updatedAt: new Date() };

  await db.tests.updateOne({ _id: new ObjectId(id) }, { $set: updatedFields });

  res.json({ message: 'Update test successfully', data: updatedFields, isSuccess: true });
});

const deleteTestById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingTest = await db.tests.findOne({ _id: new ObjectId(id) });
  if (!existingTest) {
    res.status(400);
    throw new Error('Không tìm thấy đề');
  }

  await db.tests.deleteOne({ _id: new ObjectId(id) });

  const ObjectIdArray = existingTest.questions.map(id => new ObjectId(id));
  await db.questions.deleteMany({ _id: { $in: ObjectIdArray } });

  res.json({ message: 'Xóa thành công', isDeleted: true });
});

const getMyTests = asyncHandler(async (req, res) => {
  const user = req.user;

  const tests = await db.tests.find({ userId: user.id }).toArray();

  res.json({ data: tests });
});

const getActiveTests = asyncHandler(async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  try {
    const get = await db.tests.find({ userId: id, isActived: true }).toArray();

    res.status(200).json({ data: get });
  } catch (error) {
    console.log(error);
  }
});

const updateCommonField = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedFields = req.body;
  console.log(updatedFields);

  const existingTest = await db.tests.findOne({ _id: new ObjectId(id) });
  if (!existingTest) {
    res.status(400);
    throw new Error('Không tìm thấy đề');
  }

  // const updatedTest = { ...existingTest, ...updatedFields, updatedAt: new Date() };
  // await db.tests.updateOne({ _id: new ObjectId(id) }, { $set: updatedTest });

  for (let i = 0; i < existingTest.questions.length; i++) {
    const questionId = existingTest.questions[i].id;
    const existingQuestion = await db.questions.findOne({ _id: new ObjectId(questionId) });
    console.log(existingQuestion);
    const updatedQuestion = { ...existingQuestion, ...updatedFields, updatedAt: new Date() };
    await db.questions.updateOne({ _id: new ObjectId(questionId) }, { $set: updatedQuestion });
  }

  res.json({ message: 'Cập nhật thành công' });
});

const TestController = {
  create,
  getTestById,
  updateTest,
  deleteTestById,
  getTestOverviewById,
  getMyTests,
  updateCommonField,
  getActiveTests
};

export default TestController;

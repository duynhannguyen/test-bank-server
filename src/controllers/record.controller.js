import asyncHandler from 'express-async-handler';
import { ObjectId } from 'mongodb';
import { db } from '../config/database.js';

const create = asyncHandler(async (req, res) => {
  const user = req.user;

  const { password, id } = req.body;

  const existingTest = await db.tests.findOne({ _id: new ObjectId(id) });
  if (!existingTest) {
    res.status(400);
    throw new Error('Không tìm thấy đề');
  }

  if (!existingTest.isActived) {
    res.status(400);
    throw new Error('Đề hiện không hoạt động');
  }

  if (password !== existingTest.passWord) {
    res.status(400);
    throw new Error('Password không đúng');
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

  const recordData = {
    ...existingTest,
    testId: existingTest._id,
    _id: new ObjectId(),
    questions,
    userId: user.id,
    userFullname: user.fullname,
    userEmail: user.email,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await db.records.insertOne(recordData);

  res.json({ data: recordData });
});

const updateRecord = asyncHandler(async (req, res) => {
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

  const existingRecord = await db.records.findOne({ _id: new ObjectId(id) });
  if (!existingRecord) {
    res.status(400);
    throw new Error('Không tìm thấy record');
  }

  let totalScore = 0;
  let correct = 0;
  const { studentAnswers } = payload;
  for (const question of studentAnswers) {
    const questionData = await db.questions.findOne({ _id: new ObjectId(question.id) });
    console.log(questionData);
    const answerData = questionData.answers.find(answer => answer.id === question.answer.id);
    if (answerData.isCorrect) {
      totalScore += question.score;
      correct += 1;
    }
  }

  const updatedFields = {
    ...existingRecord,
    ...rest,
    totalScore,
    correct,
    isPassed: totalScore >= payload.passScore,
    updatedAt: new Date()
  };

  await db.records.updateOne({ _id: new ObjectId(id) }, { $set: updatedFields });

  res.json({ message: 'Update record successfully', data: updatedFields, isSuccess: true });
});

const getRecordByTestId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  const existingTest = await db.tests.findOne({ _id: new ObjectId(id) });
  if (!existingTest) {
    res.status(400);
    throw new Error('Không tìm thấy đề thi');
  }

  if (existingTest.userId !== user.id) {
    res.status(400);
    throw new Error('Người dùng không hợp lệ');
  }

  const records = await db.records.find({ testId: id }).toArray();

  res.json({ data: records });
});

const getRecordById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { pw } = req.body;

  const existingRecord = await db.records.findOne({ _id: new ObjectId(id) });

  if (!existingRecord) {
    res.status(400);
    throw new Error('Không tìm thấy bài làm');
  }

  if (existingRecord.passWord !== pw) {
    res.status(400);
    throw new Error('Mã truy cập không đúng');
  }

  res.json({ data: existingRecord });
});

const RecordController = {
  create,
  updateRecord,
  getRecordByTestId,
  getRecordById
};

export default RecordController;

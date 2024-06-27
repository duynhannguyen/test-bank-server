import asyncHandler from 'express-async-handler';
import { ObjectId, Timestamp } from 'mongodb';
import { db } from '../config/database.js';

const getAllUser = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;
  const skip = (page - 1) * limit;
  try {
    const getUser = await db.users.find().skip(skip).limit(limit).toArray();
    const getAllUser = await db.users.countDocuments();
    const totalPage = Math.ceil(getAllUser / limit);
    res.status(200).json({
      message: 'Lấy dữ liệu thành công',
      data: getUser,
      paginationData: {
        totalItems: getAllUser,
        limit,
        currentPage: page,
        totalPage
      }
    });
  } catch (error) {
    res.status(500).json({ error });
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  try {
    const idStringList = req.params.id;
    const idArrayList = idStringList.split(',');
    const getAll = await db.users.find().toArray();
    for (let i = 0; i < idArrayList.length; i++) {
      const idArrayListElement = idArrayList[i];
      const existingUser = getAll.filter(user => user._id.toString() === idArrayListElement);
      if (!existingUser) {
        return res.status(400).json({ message: 'Không tìm thấy tài khoản ' });
      }
      await db.users.deleteOne({ _id: new ObjectId(idArrayListElement) });
    }

    res.status(200).json({
      message: 'Xóa tài khoản thành công'
    });
  } catch (error) {
    res.status(500).json({
      message: error
    });
  }
});

const getStaticsNumber = asyncHandler(async (req, res) => {
  try {
    const getTotalUsers = await db.users.countDocuments();

    const getTotalCollections = await db.collections.countDocuments();
    const getTotalTests = await db.tests.countDocuments();
    const getTotalQuestions = await db.questions.countDocuments();
    const getAllUsersBymonths = await db.users.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          numberOfUsers: { $sum: 1 }
        }
      },
      {
        $sort: {
          _id: 1
        }
      }
    ]);
    let result = [];
    await getAllUsersBymonths.forEach(item => {
      result = [
        ...result,
        {
          month: item?._id,
          numberOfUsers: item?.numberOfUsers
        }
      ];
    });

    res.status(200).json({
      data: {
        usersInMonths: result,
        users: getTotalUsers,
        collections: getTotalCollections,
        questions: getTotalQuestions,
        tests: getTotalTests
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error
    });
  }
});

const user = {
  getAllUser,
  deleteUser,
  getStaticsNumber
};

export default user;

import asyncHandler from 'express-async-handler';
import { ObjectId } from 'mongodb';
import { db } from '../config/database.js';
const homeSearch = asyncHandler(async (req, res) => {
  const { searchValue } = req.body;
  try {
    // if (searchValue.length < 24) {
    //   const searchByName = await db.users
    //     .find({ lastName: { $regex: `.*${searchValue}.*`, $options: 'i' } })
    //     .toArray();
    //   if (searchByName.length === 0) {
    //     return res.status(500).json({
    //       message: 'Không tìm thấy kết quả '
    //     });
    //   }
    //   return res.status(200).json({
    //     result: searchByName
    //   });
    // }
    if (searchValue.length < 24) {
      return res.status(500).json({
        message: 'Không tìm thấy kết quả '
      });
    }
    const searchQuestions = await db.questions
      .find({
        _id: new ObjectId(searchValue),
        isPrivate: false
      })
      .toArray();
    if (searchQuestions.length !== 0) {
      return res.status(200).json({
        objSearch: 'question',
        result: searchQuestions
      });
    }

    const searchTests = await db.tests
      .find({
        _id: new ObjectId(searchValue),
        isActived: true
      })
      .toArray();

    if (searchTests.length !== 0) {
      return res.status(200).json({
        objSearch: 'test',
        result: searchTests
      });
    }

    if (!searchQuestions && !searchTests) {
      return res.status(500).json({
        message: 'Không tìm thấy kết quả '
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Không tìm thấy kết quả'
    });
  }
});

const home = {
  homeSearch
};

export default home;

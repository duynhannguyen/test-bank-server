import asyncHandler from 'express-async-handler';
import { ObjectId } from 'mongodb';
import { db } from '../config/database.js';

const getGroupByUser = asyncHandler(async (req, res) => {
  const user = req.user;
  try {
    const getByUser = await db.groups.find({ userId: user.id }).toArray();
    const sortByTime = await getByUser.sort(
      (groupA, groupB) => new Date(groupB.createdAt) - new Date(groupA.createdAt)
    );
    res.status(200).json({
      data: sortByTime
    });
  } catch (error) {
    res.status(500).json({
      message: error
    });
  }
});
const createGroup = asyncHandler(async (req, res) => {
  const user = req.user;
  const { studyGroup } = req.body;

  try {
    const existingGroup = await db.groups.findOne({ studyGroup });
    if (existingGroup) {
      return res.status(400).json({
        message: 'Nhóm đã tồn tại'
      });
    }
    const newGroup = {
      userId: user.id,
      studyGroup,
      member: [],
      createdAt: new Date(),
      updateAt: new Date()
    };
    await db.groups.insertOne(newGroup);
    res.status(200).json({
      message: 'Tạo nhóm thành công'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Tạo nhóm thất bại'
    });
  }
});

const addMemberToGroup = asyncHandler(async (req, res) => {
  const memberList = req.body;
  const groupId = req.params.id;

  let exitUsers = [];

  try {
    for (let i = 0; i < memberList.length; i++) {
      const memberListChild = memberList[i];
      const existingGroup = await db.groups.findOne({ _id: new ObjectId(groupId) });
      const hasduplicateUSer = existingGroup.member.find(user => user.id === memberListChild.id);
      if (hasduplicateUSer) {
        exitUsers.push(memberListChild);
        continue;
      } else {
        await db.groups.findOneAndUpdate(
          { _id: new ObjectId(groupId) },
          { $push: { member: memberListChild } }
        );
      }
    }
    res.status(200).json({
      duplicateUser: exitUsers
    });
  } catch (error) {
    res.status(500).json({
      error: error
    });
  }
});

const deleteGroup = asyncHandler(async (req, res) => {
  const id = req.params.id;
  try {
    await db.groups.deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({
      message: 'Xóa nhóm thành công'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Xóa nhóm thất bại',
      error: error
    });
    console.log(error);
  }
});

const studyGroup = {
  createGroup,
  getGroupByUser,
  addMemberToGroup,
  deleteGroup
};

export default studyGroup;

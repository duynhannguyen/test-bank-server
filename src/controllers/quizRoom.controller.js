import asyncHandler from 'express-async-handler';
import { db } from '../config/database.js';

const create = asyncHandler(async (req, res) => {
  const user = req.user;
  const { roomID } = req.body;

  const existingRoom = await db.quizRooms.findOne({ roomID: roomID });
  if (existingRoom) {
    res.status(400);
    throw new Error('Mã phòng đã tồn tại');
  }

  const newRoom = {
    roomID,
    userId: user.id,
    userFullname: user.fullname,
    userEmail: user.email,
    createdAt: new Date(),
    questionQuantity: 0,
    topic: '',
    answers: [],
    correctIndex: '',
    time: null,
    players: []
  };

  await db.quizRooms.insertOne(newRoom);

  res.status(201).json({ id: roomID });
});

const getQuizRoomById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingRoom = await db.quizRooms.findOne({ roomID: id });
  if (!existingRoom) {
    res.status(400);
    throw new Error('Room không tồn tại!');
  }

  res.json({ data: existingRoom });
});

const updateQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { topic, answers, correctIndex, time } = req.body;

  const existingRoom = await db.quizRooms.findOne({ roomID: id });
  if (!existingRoom) {
    res.status(400);
    throw new Error('Room không tồn tại!');
  }

  if (!Array.isArray(answers) || (Array.isArray(answers) && answers.length < 4)) {
    res.status(400);
    throw new Error('Đáp án chọn không hợp lệ!');
  }

  const updatedRoomData = {
    ...existingRoom,
    topic,
    answers,
    correctIndex,
    time,
    questionQuantity: existingRoom.questionQuantity++
  };

  await db.quizRooms.updateOne({ roomID: id }, { $set: updatedRoomData });
  res.json({ data: updatedRoomData });
});

const updateAnswer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, choosedIndex } = req.body;

  const existingRoom = await db.quizRooms.findOne({ roomID: id });
  if (!existingRoom) {
    res.status(400);
    throw new Error('Room không tồn tại!');
  }

  let updatedRoomData = {};
  const existingPlayer = existingRoom.players.find(player => player.name === name);
  if (!existingPlayer) {
    const newPlayer = {
      name,
      choosedIndex,
      score: choosedIndex === existingPlayer.correctIndex ? 1 : 0
    };
    updatedRoomData = { ...existingRoom, players: [...existingRoom.players, newPlayer] };
  } else {
    const updatedPlayerData = {
      ...existingPlayer,
      choosedIndex,
      score:
        choosedIndex === existingPlayer.correctIndex
          ? existingPlayer.score + 1
          : existingPlayer.score
    };
    const updatedPlayersListData = existingRoom.players.map(player =>
      player.name === name ? updatedPlayerData : player
    );
    updatedRoomData = { ...existingRoom, players: updatedPlayersListData };
  }

  await db.quizRooms.updateOne({ roomID: id }, { $set: updatedRoomData });
  res.json({ data: updatedRoomData });
});

const QuizRoomController = {
  create,
  getQuizRoomById,
  updateQuestion,
  updateAnswer
};

export default QuizRoomController;

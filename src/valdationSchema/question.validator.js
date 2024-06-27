import * as yup from 'yup';

const multipleChoiceAnswerSchema = yup.object().shape({
  id: yup.string().required(),
  content: yup.string().required(),
  isCorrect: yup.boolean().required()
});

const questionSchema = yup.object().shape({
  topic: yup.string().required(),
  answers: yup.array().of(multipleChoiceAnswerSchema).min(2).optional(),
  type: yup.string().required(),
  subject: yup.string().nullable(),
  collection: yup.mixed().nullable(),
  isPrivate: yup.boolean()
});

const QuestionValidator = {
  questionSchema
};

export default QuestionValidator;

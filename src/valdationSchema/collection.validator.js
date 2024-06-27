import * as yup from 'yup';


const createSchema = yup.object().shape({
  name: yup.string().required(),
});

const CollectionValidator = {
  createSchema
};

export default CollectionValidator;

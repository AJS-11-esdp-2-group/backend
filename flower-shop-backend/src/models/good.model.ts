import { object, string, number, InferType, date } from 'yup';

const GoodsSchema = object({
  name: string().required('Name is required').max(55),
  goods_description: string(),
  goods_category: number().required('Goods category is required'),
  image_small: string(),
  image_large: string(),
  who_create: number().required(),
  create_date: date()
});

export type Goods = InferType<typeof GoodsSchema>;
export default GoodsSchema;

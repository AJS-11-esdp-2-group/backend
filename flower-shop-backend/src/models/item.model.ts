import { object, string, number, InferType, date } from 'yup';

const ItemSchema = object({
  item_name: string().required('Name is required').max(55),
  item_description: string(),
  id_category: number().required('Goods category is required'),
  id_subcategory: number(),
  id_under_subcategory: number(),
  id_user: number(),
  create_date: date()
});

export type Items = InferType<typeof ItemSchema>;
export default ItemSchema;
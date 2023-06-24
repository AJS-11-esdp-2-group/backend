import { object, string, number, InferType, date } from 'yup';

 const ItemSchema = object({
   item_name: string().required('Name is required').max(55),
   item_description: string(),
   id_category: number().required('Goods category is required'),
   id_subcategory: number().required('Goods subcategory is required'),
   image_small: string(),
   image_large: string(),
   id_user: number().required(),
   create_date: date()
 });

 export type Items = InferType<typeof ItemSchema>;
 export default ItemSchema;
import { object, string, InferType, date } from 'yup';

 const CategorySchema = object({
   category_name: string().required('Name of category is required').max(55),
   category_description: string()
 });

 export type Category = InferType<typeof CategorySchema>;
 export default CategorySchema;
import { object, string, InferType, date, number } from 'yup';

 const SubcategorySchema = object({
   subcategory_name: string().required('Name of subcategory is required').max(55),
   subcategory_description: string(),
   id_category: number().required('Goods category is required'),
   create_date: date()
 });

 export type Category = InferType<typeof SubcategorySchema>;
 export default SubcategorySchema;
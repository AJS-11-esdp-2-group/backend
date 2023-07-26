import { object, InferType, number } from 'yup';

 const RecipeSchema = object({
   id_bouquet: number().required('Id of bouquet is required'),
   id_item: number().required('Id of item is required'),
   qty: number().required('Qty is required')
 });

 export type Recipe = InferType<typeof RecipeSchema>;
 export default RecipeSchema;
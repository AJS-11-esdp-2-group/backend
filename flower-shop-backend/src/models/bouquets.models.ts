import { object, string, InferType, number } from 'yup';

 const BouquetSchema = object({
   bouquet_name: string().required('Name of bouquet is required').max(55),
   bouquet_description: string(),
   id_category: number().required('Category of bouquet required')
 });

 export type Bouquet = InferType<typeof BouquetSchema>;
 export default BouquetSchema;
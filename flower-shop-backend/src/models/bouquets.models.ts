import { object, string, InferType } from 'yup';

 const BouquetSchema = object({
   bouquet_name: string().required('Name of bouquet is required').max(55),
   bouquet_description: string()
 });

 export type Bouquet = InferType<typeof BouquetSchema>;
 export default BouquetSchema;
import { object, InferType, number } from 'yup';

 const CompositionBouquetsSchema = object({
   id_bouquet: number().required('Id of bouquet is required'),
   id_item: number().required('Id of item is required'),
   qty: number().required('Qty is required'),
   price: number()
 });

 export type CompositionBouquets = InferType<typeof CompositionBouquetsSchema>;
 export default CompositionBouquetsSchema;
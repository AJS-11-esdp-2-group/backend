import { object, InferType, number } from 'yup';

 const BouquetsImagesSchema = object({
   id_bouquet: number().required('Id of bouquet is required')
 });

 export type BouquetsImage = InferType<typeof BouquetsImagesSchema>;
 export default BouquetsImagesSchema;
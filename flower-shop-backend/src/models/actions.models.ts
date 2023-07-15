import { string, object, number, InferType, array, date } from 'yup';

const ItemSchema = object({
  item_id: number().required(),
  price: number().required(),
  qty: number().required(),
});

const ActionsSchema = object({
  operation_type_id: number().required('Operation is required'),
  invoice_number: string().required(),
  source_id: number().required(),
  target_id: number().required(),
  items: array(ItemSchema).required(),
  date: date(),
  update_date: date(),
  user_id: number(),
});

export type ItemForActions = InferType<typeof ItemSchema>;
export type Actions = InferType<typeof ActionsSchema>;
export default ActionsSchema;

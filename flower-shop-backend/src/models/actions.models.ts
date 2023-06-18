import { string, object, number, InferType, date } from "yup";

const ActionsSchema = object({
  operation_type_id: number().required('Operation is required'),
  source_id: number(),
  target_id: number(),
  item_id: number(),
  qty: number(),
  price: number(),
  total_price: number(),
  date: date(),
  update_date: date(),
  user_id: number()
});


export type Actions = InferType<typeof ActionsSchema>;
export default ActionsSchema;

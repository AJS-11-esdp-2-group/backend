import { object, number, date, InferType } from 'yup';

const ItemsPricesSchema = object({
  item_id: number().required(),
  price: number().required(),
  added_date: date().default(() => new Date()),
});

export type ItemsPrices = InferType<typeof ItemsPricesSchema>;
export default ItemsPricesSchema;
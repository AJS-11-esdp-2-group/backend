import { object, string, InferType, date, number } from "yup";

const UnderSubcategorySchema = object({
  under_subcategory_name: string()
    .required("Name of undersubcategory is required")
    .max(55),
  under_subcategory_description: string(),
  id_subcategories: number().required("Subcategories category is required")
});

export type UnderSubcategory = InferType<typeof UnderSubcategorySchema>;
export default UnderSubcategorySchema;

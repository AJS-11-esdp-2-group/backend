import { object, string, InferType } from 'yup'

const SupplierSchema = object().shape({
    name_supplier: string().required('Name is required'),
    email: string().email().max(55),
    phone: string().required('Phone is required').max(55),
    address: string().required('Address is required').max(55),
    comment: string().max(255)
});

export type Supplier = InferType<typeof SupplierSchema>;

export default SupplierSchema;
import { object, string, InferType } from 'yup'

const SupplierSchema = object().shape({
    name_supplier: string().required('Name is required'),
    contact_person: string().required('Contact person is required'),
    email: string().email().max(55),
    phone: string().required('Phone is required').max(55),
    address: string().required('Address is required').max(55),
    id_country: string().required(),
    id_city: string().required(),
});

export type Supplier = InferType<typeof SupplierSchema>;

export default SupplierSchema;
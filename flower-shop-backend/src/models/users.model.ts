import { object, string, number, InferType, boolean, date } from 'yup'

const UserSchema = object({
    username: string().required('Username is required!'),
    password: string().required('Password is required!'),
    email: string().email().max(55),
    email_verificated: boolean().default(false),
    phone: string().required('Phone is required').max(55),
    first_name: string().required('Name is required'), 
    last_name: string().required('Lastname is required'),
    address: string().required('Address is required').max(55),
    country: number().required(),
    city: number(),
    createdOn: date().default(() => new Date()) 
});



export type Users = InferType<typeof UserSchema>;
export default UserSchema;
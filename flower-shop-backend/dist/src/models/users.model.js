"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yup_1 = require("yup");
const UserSchema = (0, yup_1.object)({
    username: (0, yup_1.string)().required('Username is required!'),
    password: (0, yup_1.string)().required('Password is required!'),
    email: (0, yup_1.string)().email().max(55),
    email_verificated: (0, yup_1.boolean)().default(false),
    phone: (0, yup_1.string)().required('Phone is required').max(55),
    first_name: (0, yup_1.string)().required('Name is required'),
    last_name: (0, yup_1.string)().required('Lastname is required'),
    address: (0, yup_1.string)().required('Address is required').max(55),
    country: (0, yup_1.number)().required(),
    city: (0, yup_1.number)(),
    createdOn: (0, yup_1.date)().default(() => new Date())
});
exports.default = UserSchema;

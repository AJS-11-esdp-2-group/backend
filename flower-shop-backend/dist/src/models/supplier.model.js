"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yup_1 = require("yup");
const SupplierSchema = (0, yup_1.object)().shape({
    name_supplier: (0, yup_1.string)().required('Name is required'),
    contact_person: (0, yup_1.string)().required('Contact person is required'),
    email: (0, yup_1.string)().email().max(55),
    phone: (0, yup_1.string)().required('Phone is required').max(55),
    address: (0, yup_1.string)().required('Address is required').max(55),
    id_country: (0, yup_1.string)().required(),
    id_city: (0, yup_1.string)().required(),
});
exports.default = SupplierSchema;

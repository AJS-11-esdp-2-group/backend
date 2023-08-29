"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yup_1 = require("yup");
const SupplierSchema = (0, yup_1.object)().shape({
    name_supplier: (0, yup_1.string)().required('Name is required'),
    email: (0, yup_1.string)().email().max(55),
    phone: (0, yup_1.string)().required('Phone is required').max(55),
    address: (0, yup_1.string)().required('Address is required').max(55),
    comment: (0, yup_1.string)().max(255)
});
exports.default = SupplierSchema;

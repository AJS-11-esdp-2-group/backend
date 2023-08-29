"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yup_1 = require("yup");
const ItemSchema = (0, yup_1.object)({
    item_id: (0, yup_1.number)().required(),
    price: (0, yup_1.number)().required(),
    qty: (0, yup_1.number)().required(),
});
const ActionsSchema = (0, yup_1.object)({
    operation_type_id: (0, yup_1.number)().required('Operation is required'),
    invoice_number: (0, yup_1.string)().required(),
    source_id: (0, yup_1.number)().required(),
    target_id: (0, yup_1.number)().required(),
    items: (0, yup_1.array)(ItemSchema).required(),
    date: (0, yup_1.date)(),
    update_date: (0, yup_1.date)(),
    user_id: (0, yup_1.number)(),
});
exports.default = ActionsSchema;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yup_1 = require("yup");
const BouquetSchema = (0, yup_1.object)({
    bouquet_name: (0, yup_1.string)().required('Name of bouquet is required').max(55),
    bouquet_description: (0, yup_1.string)(),
    id_category: (0, yup_1.number)().required('Category of bouquet required')
});
exports.default = BouquetSchema;

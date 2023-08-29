"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yup_1 = require("yup");
const SubcategorySchema = (0, yup_1.object)({
    subcategory_name: (0, yup_1.string)().required('Name of subcategory is required').max(55),
    subcategory_description: (0, yup_1.string)(),
    id_category: (0, yup_1.number)().required('Goods category is required')
});
exports.default = SubcategorySchema;

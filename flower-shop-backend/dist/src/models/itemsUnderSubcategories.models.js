"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yup_1 = require("yup");
const UnderSubcategorySchema = (0, yup_1.object)({
    under_subcategory_name: (0, yup_1.string)()
        .required("Name of undersubcategory is required")
        .max(55),
    under_subcategory_description: (0, yup_1.string)(),
    id_subcategories: (0, yup_1.number)().required("Subcategories category is required")
});
exports.default = UnderSubcategorySchema;

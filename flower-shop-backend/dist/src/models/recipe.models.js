"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yup_1 = require("yup");
const RecipeSchema = (0, yup_1.object)({
    id_bouquet: (0, yup_1.number)().required('Id of bouquet is required'),
    id_item: (0, yup_1.number)().required('Id of item is required'),
    qty: (0, yup_1.number)().required('Qty is required')
});
exports.default = RecipeSchema;

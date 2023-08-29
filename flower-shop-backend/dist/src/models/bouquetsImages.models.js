"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yup_1 = require("yup");
const BouquetsImagesSchema = (0, yup_1.object)({
    id_bouquet: (0, yup_1.number)().required('Id of bouquet is required')
});
exports.default = BouquetsImagesSchema;

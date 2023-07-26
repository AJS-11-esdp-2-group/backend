"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yup_1 = require("yup");
const ItemsPricesSchema = (0, yup_1.object)({
    item_id: (0, yup_1.number)().required(),
    price: (0, yup_1.number)().required(),
    added_date: (0, yup_1.date)().default(() => new Date()),
});
exports.default = ItemsPricesSchema;

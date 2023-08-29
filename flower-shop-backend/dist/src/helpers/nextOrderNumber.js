"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db/db"));
const nextOrderNumbers = (amount) => __awaiter(void 0, void 0, void 0, function* () {
    const lastOrderNumbers = (yield db_1.default.query(`select id, order_number from orders order by id DESC limit 50`)).rows;
    if (!lastOrderNumbers.length) {
        let numbers = [];
        for (let i = 1; i <= amount; i++) {
            numbers.push('av-' + i.toString().padStart(4, '0'));
        }
        return numbers;
    }
    ;
    const orderNumbers = lastOrderNumbers.map(order => {
        return parseInt(order.order_number.slice(3));
    });
    const maxNumber = Math.max(...orderNumbers);
    let numbers = [];
    for (let i = 1; i <= amount; i++) {
        numbers.push('av-' + (i + maxNumber).toString().padStart(4, '0'));
    }
    return numbers;
});
exports.default = nextOrderNumbers;

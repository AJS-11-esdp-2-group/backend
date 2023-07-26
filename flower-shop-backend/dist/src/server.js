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
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const jet_logger_1 = __importDefault(require("jet-logger"));
const items_controller_1 = __importDefault(require("@src/controllers/items.controller"));
const suppliers_controller_1 = __importDefault(require("@src/controllers/suppliers.controller"));
const users_controller_1 = __importDefault(require("@src/controllers/users.controller"));
const actions_controller_1 = __importDefault(require("@src/controllers/actions.controller"));
const suppliersStorages_controller_1 = __importDefault(require("@src/controllers/suppliersStorages.controller"));
const storages_controller_1 = __importDefault(require("@src/controllers/storages.controller"));
const ItemsCategory_controller_1 = __importDefault(require("@src/controllers/ItemsCategory.controller"));
const ItemsSubcategory_controller_1 = __importDefault(require("@src/controllers/ItemsSubcategory.controller"));
const location_controller_1 = __importDefault(require("@src/controllers/location.controller"));
const bouquets_controller_1 = __importDefault(require("@src/controllers/bouquets.controller"));
const itemsUnderSubcategories_controllers_1 = __importDefault(require("./controllers/itemsUnderSubcategories.controllers"));
const recipes_controller_1 = __importDefault(require("@src/controllers/recipes.controller"));
const bouquetsImage_controller_1 = __importDefault(require("./controllers/bouquetsImage.controller"));
const itemsPrices_controller_1 = __importDefault(require("@src/controllers/itemsPrices.controller"));
const sale_controller_1 = __importDefault(require("@src/controllers/sale.controller"));
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    app.listen(PORT, () => {
        jet_logger_1.default.info(`Server is running on http://localhost:${PORT}`);
    });
});
const app = (0, express_1.default)();
const PORT = 8000;
app.use(express_1.default.json());
app.use(express_1.default.static("public"));
app.use((0, cors_1.default)());
app.use("/items", items_controller_1.default);
app.use("/suppliers", suppliers_controller_1.default);
app.use("/users", users_controller_1.default);
app.use("/supply", actions_controller_1.default);
app.use("/suppliers_controllers", suppliersStorages_controller_1.default);
app.use("/storages", storages_controller_1.default);
app.use("/items_category", ItemsCategory_controller_1.default);
app.use("/items_subcategory", ItemsSubcategory_controller_1.default);
app.use("/items_under_subcategory", itemsUnderSubcategories_controllers_1.default);
app.use("/location", location_controller_1.default);
app.use("/bouquets", bouquets_controller_1.default);
app.use("/recipes", recipes_controller_1.default);
app.use("/bouquets_images", bouquetsImage_controller_1.default);
app.use("/items_prices", itemsPrices_controller_1.default);
app.use("/sales", sale_controller_1.default);
run().catch(jet_logger_1.default.err);

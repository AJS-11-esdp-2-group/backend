import express, { Request, Response } from 'express';
import itemController from "./controllers/items.controller";
import suppliersController from "./controllers/suppliers.controller";
import usersController from "./controllers/users.controller";
import actionsController from "./controllers/actions.controller";
import suppliersStoragesController from './controllers/suppliersStorages.controller'
import storagesController from './controllers/storages.controller'
import itemsCategoryController from "./controllers/ItemsCategory.controller";
import itemsSubcategoryController from "./controllers/ItemsSubcategory.controller";
import bouquetController from "./controllers/bouquets.controller";
import recipesController from "./controllers/recipes.controller";
import bouquetsImageController from "./controllers/bouquetsImage.controller";
import itemsPricesControllers from './controllers/itemsPrices.controller';
import saleControllers from './controllers/sale.controller';

const app = express()
const port = process.env.PORT || 8080


app.use(express.json());
app.use(express.static("public"));


app.get('/', (_req: Request, res: Response) => {
	return res.send('Express Typescript on Vercel 8')
})

app.get('/ping', (_req: Request, res: Response) => {
	return res.send('pong 🏓')
})

app.use("/items", itemController);
app.use("/suppliers", suppliersController);
app.use("/users", usersController);
app.use("/supply", actionsController);
app.use("/suppliers_controllers", suppliersStoragesController);
app.use("/storages", storagesController);
app.use("/items_category", itemsCategoryController);
app.use("/items_subcategory", itemsSubcategoryController);
app.use("/bouquets", bouquetController);
app.use("/recipes", recipesController);
app.use("/bouquets_images", bouquetsImageController);
app.use("/items_prices", itemsPricesControllers);
app.use("/sales", saleControllers);

app.listen(port, () => {
	return console.log(`Server is listening on ${port}`)
});
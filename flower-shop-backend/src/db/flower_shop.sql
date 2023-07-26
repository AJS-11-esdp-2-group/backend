CREATE TABLE items_categories (
	id_category serial PRIMARY KEY,
	category_name VARCHAR(255) NOT NULL UNIQUE,
	category_name_description TEXT
);

CREATE TABLE employees (
	id_employee serial PRIMARY KEY,
	name_employee VARCHAR(55) NOT NULL UNIQUE,
	job_title VARCHAR(55)
);

CREATE TABLE items (
	id_item serial PRIMARY KEY,
	item_name VARCHAR(55) NOT NULL UNIQUE,
	item_description TEXT,
	id_category INT NOT NULL,
	image_small VARCHAR,
	image_large VARCHAR,
	create_date TIMESTAMP NOT NULL,
	id_user INT NOT NULL,
	CONSTRAINT items_fk0 FOREIGN KEY (id_category) REFERENCES items_categories(id_category) ON UPDATE CASCADE,
	CONSTRAINT items_fk1 FOREIGN KEY (id_user) REFERENCES employees(id_employee) ON UPDATE CASCADE
);

CREATE TABLE countries (
	id_country serial PRIMARY KEY,
	name_country VARCHAR(55) NOT NULL UNIQUE
);

CREATE TABLE cities (
	id_city serial PRIMARY KEY,
	name_city VARCHAR(55) NOT NULL UNIQUE,
	id_country INT NOT NULL,
	CONSTRAINT cities_fk0 FOREIGN KEY (id_country) REFERENCES countries(id_country) ON UPDATE CASCADE
);

CREATE TABLE suppliers (
	id_supplier serial PRIMARY KEY,
	name_supplier VARCHAR(55) NOT NULL,
	contact_person VARCHAR(55) NOT NULL,
	email VARCHAR(55),
	phone VARCHAR(55) NOT NULL UNIQUE,
	address VARCHAR(55) NOT NULL UNIQUE,
	id_country INT,
	id_city INT,
	create_date TIMESTAMP NOT NULL,
	CONSTRAINT suppliers_fk0 FOREIGN KEY (id_country) REFERENCES countries(id_country) ON UPDATE CASCADE,
	CONSTRAINT suppliers_fk1 FOREIGN KEY (id_city) REFERENCES cities(id_city) ON UPDATE CASCADE
);

CREATE EXTENSION pgcrypto;

CREATE TABLE users (
	id_user serial PRIMARY KEY,
	username VARCHAR(55) NOT NULL UNIQUE,
	password VARCHAR(255) NOT NULL,
	token VARCHAR(55) UNIQUE,
	role VARCHAR(55) DEFAULT 'user',
	email VARCHAR(55) NOT NULL UNIQUE,
	email_verificated BOOLEAN NOT NULL,
	phone VARCHAR(55) NOT NULL UNIQUE,
	avatar VARCHAR(55) UNIQUE,
	first_name VARCHAR(55) NOT NULL,
	last_name VARCHAR(55) NOT NULL,
	address VARCHAR(100) NOT NULL,
	id_country INT,
	id_city INT,
	create_date TIMESTAMP NOT NULL,
	last_update_date TIMESTAMP,
	CONSTRAINT users_fk0 FOREIGN KEY (id_country) REFERENCES countries(id_country) ON UPDATE CASCADE,
	CONSTRAINT users_fk1 FOREIGN KEY (id_city) REFERENCES cities(id_city) ON UPDATE CASCADE
);


-- Вставка категорий товаров
INSERT INTO items_categories (category_name, category_name_description)
VALUES ('Flowers', 'Different kinds of flowers');

INSERT INTO items_categories (category_name, category_name_description)
VALUES ('Bouqets', 'Ready-made bouquets');

INSERT INTO items_categories (category_name, category_name_description)
VALUES ('Furniture', 'Bouquet wrapping paper');

INSERT INTO items_categories (category_name, category_name_description)
VALUES ('Stuffed Toys', 'Soft toys in different sizes and colors');


-- Вставка сотрудников
INSERT INTO employees (name_employee, job_title)
VALUES ('Anastasiya', 'manager');

INSERT INTO employees (name_employee, job_title)
VALUES ('Vera', 'florist');

INSERT INTO employees (name_employee, job_title)
VALUES ('Marina', 'florist');


-- Вставка стран
INSERT INTO countries (name_country)
VALUES ('Kazakhstan');

INSERT INTO countries (name_country)
VALUES ('Netherlands');


-- Вставка городов
INSERT INTO cities (name_city, id_country)
VALUES ('Amsterdam', (SELECT id_country FROM countries where name_country='Netherlands'));

INSERT INTO cities (name_city, id_country)
VALUES ('Almaty', (SELECT id_country FROM countries where name_country='Kazakhstan'));

INSERT INTO cities (name_city, id_country)
VALUES ('Astana', (SELECT id_country FROM countries where name_country='Kazakhstan'));

INSERT INTO cities (name_city, id_country)
VALUES ('Shymkent', (SELECT id_country FROM countries where name_country='Kazakhstan'));


-- Вставка товаров
INSERT INTO items (item_name, item_description,id_category, image_small, image_large, create_date, id_user)
VALUES ('Дельфиниум', 'Прекрасная композиция', (SELECT id_category FROM items_categories where category_name='Flowers'), 'imgSmall1.img','imgLarge1.img','2023-02-01 12:00:00', (SELECT id_employee FROM employees where name_employee='Anastasiya'));

INSERT INTO items (item_name, item_description,id_category, image_small, image_large, create_date, id_user)
VALUES ('Одноголовая хризантема', 'Прекрасная композиция',(SELECT id_category FROM items_categories where category_name='Flowers'), 'imgSmall2.img','imgLarge2.img', '2023-02-01 12:00:00', (SELECT id_employee FROM employees where name_employee='Vera'));

INSERT INTO items (item_name, item_description,id_category, image_small, image_large, create_date, id_user)
VALUES ('Кустовая хризантема', 'Прекрасная композиция',(SELECT id_category FROM items_categories where category_name='Flowers'), 'imgSmall3.img','imgLarge3.img', '2023-02-01 12:00:00', (SELECT id_employee FROM employees where name_employee='Marina'));

INSERT INTO items (item_name, item_description,id_category, image_small, image_large, create_date, id_user)
VALUES ('Гипсофила', 'Прекрасная композиция',(SELECT id_category FROM items_categories where category_name='Flowers'), 'imgSmall4.img','imgLarge4.img', '2023-02-01 12:00:00', (SELECT id_employee FROM employees where name_employee='Anastasiya'));

INSERT INTO items (item_name, item_description,id_category, image_small, image_large, create_date, id_user)
VALUES ('Кустовая пионовидная роза (Джульетта)','Прекрасная композиция', (SELECT id_category FROM items_categories where category_name='Flowers'), 'imgSmall5.img','imgLarge5.img', '2023-02-01 12:00:00', (SELECT id_employee FROM employees where name_employee='Vera'));

INSERT INTO items (item_name, item_description,id_category, image_small, image_large, create_date, id_user)
VALUES ('Тюльпан', 'Прекрасная композиция',(SELECT id_category FROM items_categories where category_name='Flowers'), 'imgSmall6.img','imgLarge6.img', '2023-02-01 12:00:00', (SELECT id_employee FROM employees where name_employee='Anastasiya'));

INSERT INTO items (item_name, item_description,id_category, image_small, image_large, create_date, id_user)
VALUES ('Сухоцвет 1 пучок (5 шт)','Прекрасная композиция', (SELECT id_category FROM items_categories where category_name='Flowers'), 'imgSmall7.img','imgLarge7.img', '2023-04-10 12:00:00', (SELECT id_employee FROM employees where name_employee='Anastasiya'));

INSERT INTO items (item_name,item_description, id_category, image_small, image_large, create_date, id_user)
VALUES ('Прозрачная упаковка в рулоне в связке 5 шт в 1', 'Прекрасная композиция',(SELECT id_category FROM items_categories where category_name='Furniture'), 'imgSmall8.img','imgLarge8.img', '2023-05-20 12:00:00', (SELECT id_employee FROM employees where name_employee='Anastasiya'));

INSERT INTO items (item_name, item_description,id_category, image_small, image_large, create_date, id_user)
VALUES ('Упаковочная лента в наборе 7 шт', 'Прекрасная композиция', (SELECT id_category FROM items_categories where category_name='Furniture'), 'imgSmall9.img','imgLarge9.img', '2023-05-20 12:00:00', (SELECT id_employee FROM employees where name_employee='Vera'));

INSERT INTO items (item_name,item_description, id_category, image_small, image_large, create_date, id_user)
VALUES ('Атласные ленты', 'Прекрасная композиция',(SELECT id_category FROM items_categories where category_name='Furniture'), 'imgSmall10.img','imgLarge10.img', '2023-05-20 12:00:00', (SELECT id_employee FROM employees where name_employee='Vera'));

INSERT INTO items (item_name, item_description,id_category, image_small, image_large, create_date, id_user)
VALUES ('Корзина плетеная', 'Прекрасная композиция',(SELECT id_category FROM items_categories where category_name='Furniture'), 'imgSmall11.img','imgLarge11.img', '2023-05-20 12:00:00', (SELECT id_employee FROM employees where name_employee='Vera'));

INSERT INTO items (item_name,item_description, id_category, image_small, image_large, create_date, id_user)
VALUES ('Композиция Julietta', 'Прекрасная композиция для самых нежных чувств', (SELECT id_category FROM items_categories where category_name='Bouqets'), 'imgSmall2.img','imgLarge2.img', '2023-06-01 12:00:00', (SELECT id_employee FROM employees where name_employee='Vera'));

INSERT INTO items (item_name,item_description, id_category, image_small, image_large, create_date, id_user)
VALUES ('Нежное облако', 'Воздушный букет из гортензии и гипсофилы', (SELECT id_category FROM items_categories where category_name='Bouqets'), 'imgSmall13.img','imgLarge13.img', '2023-06-01 12:00:00', (SELECT id_employee FROM employees where name_employee='Marina'));

INSERT INTO items (item_name,item_description, id_category, image_small, image_large, create_date, id_user)
VALUES ('Букет ROYAL', 'Объёмный букет из спрей-роз и эвкалипта', (SELECT id_category FROM items_categories where category_name='Bouqets'), 'imgSmall14.img','imgLarge14.img', '2023-06-01 12:00:00', (SELECT id_employee FROM employees where name_employee='Marina'));

INSERT INTO items (item_name, item_description,id_category, image_small, image_large, create_date, id_user)
VALUES ('Букет QUEEN', 'Моно букет из 51 голландской розы в живом оформлении', (SELECT id_category FROM items_categories where category_name='Bouqets'), 'imgSmall15.img','imgLarge15.img', '2023-06-01 12:00:00', (SELECT id_employee FROM employees where name_employee='Vera'));

-- Вставка поставщиков
INSERT INTO suppliers (name_supplier, contact_person, email, phone, address, id_country, id_city, create_date)
VALUES ('Supplier1', 'Elizabeth', 'supplier1@gmail.com', '+31 10 000 0000', 'Kalverstraat, 1',
(SELECT id_country FROM countries where name_country='Netherlands'), (SELECT id_city FROM cities where name_city='Amsterdam'), '2023-06-01 12:00:00');

INSERT INTO suppliers (name_supplier, contact_person, email, phone, address, id_country, id_city, create_date)
VALUES ('Supplier2', 'Victor', 'supplier2@gmail.com', '+7 777 000 0000', 'Dostyk, 100',
(SELECT id_country FROM countries where name_country='Kazakhstan'), (SELECT id_city FROM cities where name_city='Almaty'), '2023-02-10 12:00:00');

INSERT INTO suppliers (name_supplier, contact_person, email, phone, address, id_country, id_city, create_date)
VALUES ('Supplier3', 'Max', 'supplier3@gmail.com', '+7 707 111 1111', 'Tauelsyzdyk, 12',
(SELECT id_country FROM countries where name_country='Kazakhstan'), (SELECT id_city FROM cities where name_city='Astana'), '2023-04-25 12:00:00');

INSERT INTO suppliers (name_supplier, contact_person, email, phone, address, id_country, id_city, create_date)
VALUES ('Supplier4', 'Anna', 'supplier4@gmail.com', '+7 747 000 0000', 'Panfilova, 10',
(SELECT id_country FROM countries where name_country='Kazakhstan'), (SELECT id_city FROM cities where name_city='Shymkent'), '2023-02-28 12:00:00');

INSERT INTO users (
	username,
	password,
	token,
	role,
	email,
	email_verificated,
	phone,
	avatar,
	first_name,
	last_name,
	address,
	id_country,
	id_city,
	create_date,
	last_update_date)
VALUES (
	'admin', 
	crypt('qwerty', gen_salt('bf')),
	NULL,
	'admin', 
	'admin@mail.com', 
	true, 
	'+7 700 000 00 00',
	NULL,
	'admin',
	'ADMIN',
	'Алмалинский район, ул.Абылай-хана, д.147',
	(SELECT id_country FROM countries where name_country='Kazakhstan'),
	(SELECT id_city FROM cities where name_city='Almaty'),
	'2023-02-28 12:00:00',
	NULL);

INSERT INTO users (
	username,
	password,
	token,
	role,
	email,
	email_verificated,
	phone,
	avatar,
	first_name,
	last_name,
	address,
	id_country,
	id_city,
	create_date,
	last_update_date)
VALUES (
	'user', 
	crypt('qwerty', gen_salt('bf')),
	NULL,
	'user', 
	'user@mail.com', 
	true, 
	'+7 702 000 00 00',
	NULL,
	'user',
	'USER',
	'Алмалинский район, ул.Абылай-хана, д.64',
	(SELECT id_country FROM countries where name_country='Kazakhstan'),
	(SELECT id_city FROM cities where name_city='Almaty'),
	'2023-04-28 12:00:00',
	NULL);

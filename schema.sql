DROP DATABASE IF EXISTS bamazon_DB;
CREATE DATABASE bamazon_DB;

USE bamazon_DB;

CREATE TABLE inventory(
    item_id INT NOT NULL AUTO_INCREMENT,
    PRIMARY KEY (item_id),
    product_name VARCHAR (200),
    product_sales FLOAT,
    department_name VARCHAR (50),
    price FLOAT,
    stock_quantity INT
);

INSERT INTO inventory
    (product_name, product_sales, department_name, price,stock_quantity)
VALUES
("Chicken", 112, "Produce", 8, 15),
("Strawberry", 120, "Produce", 3, 20),
("Potatoes", 100, "Produce", 1, 20),
("Polka Dot Hat", 90, "Clothing", 10, 12),
("Chicken Socks", 400, "Clothing", 5, 10),
("Farley Shirt", 1000, "Clothing", 20, 10),
("Bacon Bandages", 1000, "Health Care", 10, 100),
("GameCube", 400, "Electronics", 200, 8),
("Play Station 4", 300, "Electronics", 300, 8),
("Xbox 360", 300, "Electronics", 150, 8),
("Dell Computer", 0, "Electronics", 800, 1);


    
CREATE TABLE departments(
    department_id INT NOT NULL AUTO_INCREMENT,
    PRIMARY KEY (department_id),
    department_name VARCHAR (200),
    over_head_costs FLOAT
);

INSERT INTO departments
    (department_name, over_head_costs)
VALUES
    ("Produce", 500),
    ("Clothing", 450),
    ("Drinks", 450),
    ("Toys", 1000),
    ("Food Bar", 800),
    ("Health Care", 400),
    ("Electronics", 1000);
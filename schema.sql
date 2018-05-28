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
("Chicken", 112, "produce", 8, 15),
("Strawberry", 120, "produce", 3, 20),
("Potatoes", 100, "produce", 1, 20),
("Polka Dot Hat", 90, "clothing", 10, 12),
("Bacon Socks", 400, "clothing", 5, 10),
("Farley Shirt", 1000, "clothing", 20, 10),
("GameCube", 400, "electronics", 200, 8),
("Play Station 4", 300, "electronics", 300, 8),
("Xbox 360", 300, "electronics", 150, 8),
("Dell Computer", 0, "electronics", 800, 1);


    
CREATE TABLE departments(
    department_id INT NOT NULL AUTO_INCREMENT,
    PRIMARY KEY (department_id),
    department_name VARCHAR (200),
    over_head_costs FLOAT
);

INSERT INTO departments
    (department_name, over_head_costs)
VALUES
    ("produce", 500),
    ("clothing", 450),
    ("drinks", 450),
    ("electronics", 1000);
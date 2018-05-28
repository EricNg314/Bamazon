DROP DATABASE IF EXISTS bamazon_DB;
CREATE DATABASE bamazon_DB;

USE bamazon_DB;

CREATE TABLE inventory(
    item_id INT NOT NULL AUTO_INCREMENT,
    PRIMARY KEY (item_id),
    product_name VARCHAR (200),
    department_name VARCHAR (50),
    price FLOAT,
    stock_quantity INT
);

INSERT INTO inventory
    (product_name, department_name, price,stock_quantity)
VALUES
    ("Chicken", "produce", 8, 10),
    ("Strawberry", "produce", 3, 20),
    ("Potatoes", "produce", 1, 20),
    ("Polka Dot Hat", "clothing", 10, 12),
    ("Bacon Socks", "clothing", 5, 10),
    ("Farley Shirt", "clothing", 20, 10),
    ("GameCube", "electronics", 200, 8),
    ("Play Station 4", "electronics", 300, 8),
    ("Xbox 360", "electronics", 150, 8),
    ("Dell Computer", "electronics", 150, 1);
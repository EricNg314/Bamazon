require("dotenv").config();

var Mysql = require("mysql");
var Inquirer = require("inquirer");
var Table = require("cli-table");

var keys = require("./keys.js");

var connection = Mysql.createConnection({
    host: keys.mysqlKey["mysql_DB_host"],
    port: keys.mysqlKey["mysql_DB_port"],
    user: keys.mysqlKey["mysql_DB_user"],
    password: keys.mysqlKey["mysql_DB_password"],
    database: "bamazon_DB"

});

connection.connect(function (err) {
    if (err) throw err;
    start();

});

function start() {
    console.log("\n -------------------------------------------------------------------- \n");
    var lowQty = 4;
    Inquirer.prompt(
        {
            type: "list",
            name: "task",
            message: "What would you like to do?",
            choices: ["View Products for Sale", "View Low Inventory (Less Than " + lowQty + ")", "Add to Inventory", "Add New Products", "Delete Products", "Exit Bamazon Manager"]
        }
    ).then(function (userInput) {
        // console.log(userInput.task);
        switch (userInput.task) {
            case "View Products for Sale":
                // console.log("For Sale");
                viewProducts();
                break;
            case "View Low Inventory (Less Than " + lowQty + ")":
                // console.log("Items in inventory");
                viewLowProducts(lowQty);
                break;
            case "Add to Inventory":
                // console.log("Adding inventory");
                addInventory();
                break;
            case "Add New Products":
                // console.log("Adding a new product");
                break;
            case "Delete Products":
                console.log("Deleting a product");
                break;
            case "Exit Bamazon Manager":
                quitApp();
                break;
        };

    });
};

function viewProducts() {
    connection.query("SELECT * FROM inventory", function (err, res) {
        // console.log(res);
        if (res.length !== 0) {
            showSQLTable(res);
            start();
        } else {
            console.log("Sorry no items available.");
            start();
        };
    });
};


function viewLowProducts(lowQty) {
    connection.query("SELECT * FROM inventory WHERE stock_quantity < " + lowQty, function (err, res) {
        // console.log(res);
        if (res.length !== 0) {
            showSQLTable(res);
            start();
        } else {
            console.log("Sorry no items below " + lowQty + " quantity available.");
            start();
        };
    });
};

function addInventory() {
    console.log("\n -------------------------------------------------------------------- \n");
    connection.query("SELECT item_id, product_name, stock_quantity FROM inventory", function (err, res) {
        if (err) throw err;

        var listOfID = [];
        for (let i = 0; i < res.length; i++) {
            listOfID.push(res[i]["item_id"]);
        };
        console.log("Here's a list of available items to add:")
        showSQLTable(res);
        console.log("\n");

        Inquirer.prompt(
            {
                type: "input",
                name: "productID",
                message: "Please provide the item ID you wish to add. [Quit with Q]",
                validate: function (input) {
                    var checkID = false;
                    for (let j = 0; j < listOfID.length; j++) {
                        if ((parseFloat(input) === listOfID[j]) || (input.toUpperCase() === "Q")) {
                            checkID = true;
                        }
                    }
                    if (checkID === false) {
                        console.log("\n Item ID " + input + " is not available, please input a valid ID. \n");
                    }
                    return checkID;
                }
            }
        ).then(function (userInput) {
            if (userInput["productID"].toUpperCase() !== "Q") {

                var inputID = parseInt(userInput["productID"]);
                var selectedItem = {};
                for (let h = 0; h < res.length; h++) {
                    if (inputID === res[h]["item_id"]) {
                        selectedItem = res[h];
                    }
                }
                // console.log(selectedItem);

                qtyToAdd(selectedItem, inputID);
            } else {
                quitApp();
            };
        });
    });

    function qtyToAdd(selectedItem, inputID) {
        // console.log("qtyToAdd function entered.");
        Inquirer.prompt(
            {
                type: "input",
                name: "quantity",
                message: "How much would you like to add? [Quit with Q]",
                validate: function (input) {
                    if (input.toUpperCase() === "Q") {
                        return true;
                    } else if (input < 0) {
                        console.log("\n Error: Unable to process due to negative quantity.");
                        return false;
                    } else if (isNaN(input)) {
                        console.log("\n Error: " + input + " is not a number, please enter a number.");
                        return false;
                    } else if (!(Number.isInteger(parseFloat(input)))) {
                        console.log("\n Error: " + input + " is NOT an integer");
                        return false;
                    } else {
                        return true;
                    }

                }
            }
        ).then(function (userInput) {
            if (userInput["quantity"].toUpperCase() !== "Q") {
                var inputQty = parseInt(userInput["quantity"]);
                updateQty(selectedItem, inputQty);

            } else {
                quitApp();
            };


        });
    };

    function updateQty(selectedItem, inputQty) {
        console.log("\n -------------------------------------------------------------------- \n");
        connection.query("UPDATE inventory SET ? WHERE ?",
            [
                {
                    stock_quantity: selectedItem["stock_quantity"] + inputQty
                },
                {
                    item_id: selectedItem["item_id"]
                }
            ]
        )
        connection.query("SELECT * FROM inventory WHERE ?",
            {
                item_id: selectedItem["item_id"]
            }, function (err, res) {
                if (err) throw err;

                showSQLTable(res);
                console.log(selectedItem["product_name"] + " has been successfully updated to " + res[0]["stock_quantity"]);

                moreTasks();
            }
        );

    };
};


function moreTasks() {
    console.log("\n -------------------------------------------------------------------- \n");
    Inquirer.prompt(
        {
            type: "confirm",
            name: "confirm",
            message: "Would you like to do more tasks?"
        }
    ).then(function (userInput) {
        if (userInput["confirm"] === true) {
            start();
        } else {
            quitApp();
        };
    });
};


function quitApp() {
    console.log("\n ==================================================================== \n");
    console.log("Thank you for using Bamazon Manager for all your managerial needs!");
    connection.end();
};

function showSQLTable(res) {
    var keys = Object.keys(res[0]);
    var table = new Table({
        head: keys
    });

    for (let i = 0; i < res.length; i++) {
        var rowData = [];
        for (var objKeys in res[i]) {
            rowData.push(res[i][objKeys]);
        }
        table.push(rowData);
    };
    console.log(table.toString());
};
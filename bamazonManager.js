require("dotenv").config();

var Mysql = require("mysql");
var Inquirer = require("inquirer");
var Table = require("cli-table2");
var Colors = require("colors");
var keys = require("./keys.js");

var connection = Mysql.createConnection({
    host: keys.mysqlKey["mysql_DB_host"],
    port: keys.mysqlKey["mysql_DB_port"],
    user: keys.mysqlKey["mysql_DB_user"],
    password: keys.mysqlKey["mysql_DB_password"],
    database: "bamazon_DB"

});

Colors.setTheme({
    sqlHeaders: ['yellow', 'underline']
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
            choices: ["View Products for Sale", "View Low Inventory (Less Than " + lowQty + ")", "Add to Inventory", "Add New Products", "Delete a Product", "Exit Bamazon Manager"]
        }
    ).then(function (userInput) {

        switch (userInput.task) {
            case "View Products for Sale":
                viewProducts();
                break;

            case "View Low Inventory (Less Than " + lowQty + ")":
                viewLowProducts(lowQty);
                break;

            case "Add to Inventory":
                addInventory();
                break;

            case "Add New Products":
                addNewProduct();
                break;

            case "Delete a Product":
                deleteProduct();
                break;

            case "Exit Bamazon Manager":
                quitApp();
                break;
        };

    });
};

function viewProducts() {
    connection.query("SELECT * FROM inventory", function (err, res) {
        if (err) throw err;

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

                qtyToAdd(selectedItem, inputID);
            } else {
                quitApp();
            };
        });
    });

    function qtyToAdd(selectedItem, inputID) {
        console.log("\n -------------------------------------------------------------------- \n");
        Inquirer.prompt(
            {
                type: "input",
                name: "quantity",
                message: "How much would you like to add? [Quit with Q]",
                validate: function (input) {
                    var check = checkIfNumbNegative(input);
                    if(input.toUpperCase() === "Q"){
                        return true;
                    }
                    if (!(Number.isInteger(parseFloat(input)))) {
                        console.log("\n Error: " + input + " is NOT an integer");
                        return false;
                    }
                    return check;
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

                start();
            }
        );

    };
};

function addNewProduct() {
    console.log("\n -------------------------------------------------------------------- \n");
    Inquirer.prompt(
        {
            type: "input",
            name: "name",
            message: "What new product would you like to add? [Quit with Q]"
        }
    ).then(function (userInput) {
        if (userInput["name"].toUpperCase() !== "Q") {
            var product = {};
            product["product_name"] = userInput["name"];
            requestDept(product);

        } else {
            quitApp();
        }

    });

    function requestDept(product) {
        console.log("\n -------------------------------------------------------------------- \n");

        var deptList = [];
        connection.query("SELECT DISTINCT department_name FROM departments", function (err, res) {
            for (let i = 0; i < res.length; i++) {
                deptList.push(res[i]["department_name"]);
            }

            Inquirer.prompt(
                {
                    type: "list",
                    name: "department",
                    message: "What department should this go under? [Quit with Q]",
                    choices: deptList
                }
            ).then(function (userInput) {
                if (userInput["department"].toUpperCase() !== "Q") {
                    product["department_name"] = userInput["department"];

                    requestCost(product);

                } else {
                    quitApp();
                };
            });
        });
    };

    function requestCost(product) {
        console.log("\n -------------------------------------------------------------------- \n");
        Inquirer.prompt(
            {
                type: "input",
                name: "cost",
                message: "What is the price of this item? [Quit with Q]",
                validate: function (input) {
                    var check = checkIfNumbNegative(input);

                    //Checking if there's more than 2 decimal points.
                    var inputLength = ((parseFloat(input)).toString().length);
                    var inputIntLength = ((parseInt(input)).toString().length)
                    if ((inputLength - inputIntLength) > 2) {
                        check = false;
                        console.log("\n Error: Too many decmial points, max of 2.");
                    };
                    return check;
                }
            }
        ).then(function (userInput) {
            if (userInput["cost"].toUpperCase() !== "Q") {
                product["price"] = parseFloat(userInput["cost"]);

                requestQty(product);

            } else {
                quitApp();
            };
        });
    };

    function requestQty(product) {
        console.log("\n -------------------------------------------------------------------- \n");
        Inquirer.prompt(
            {
                type: "input",
                name: "quantity",
                message: "What is the quantity you wish to add? [Quit with Q]",
                validate: function (input) {
                    var check = checkIfNumbNegative(input);
                    if(input.toUpperCase() === "Q"){
                        return true;
                    }
                    if (!(Number.isInteger(parseFloat(input)))) {
                        console.log("\n Error: " + input + " is NOT an integer");
                        return false;
                    }
                    return check;
                }
            }
        ).then(function (userInput) {
            if (userInput["quantity"].toUpperCase() !== "Q") {
                product["stock_quantity"] = parseInt(userInput["quantity"]);

                addToDB(product);

            } else {
                quitApp();
            };
        });
    };

    function addToDB(product) {
        console.log("\n -------------------------------------------------------------------- \n");
        connection.query("INSERT INTO inventory SET ?",
            {
                product_name: product["product_name"],
                department_name: product["department_name"],
                product_sales: 0,
                price: product["price"],
                stock_quantity: product["stock_quantity"]
                // }, function(err){
            }, function (err, res) {
                if (err) throw err;

                connection.query("SELECT * FROM inventory WHERE ?", { item_id: res.insertId }, function (err, resQuery) {
                    if (err) throw err;
                    showSQLTable(resQuery);

                    console.log("\n " + product["product_name"] + " has been added to Bamazon!");

                    start();
                })
            }
        );
    };

};

function deleteProduct() {

    console.log("\n -------------------------------------------------------------------- \n");
    connection.query("SELECT * FROM inventory", function (err, res) {
        if (err) throw err;
        // console.log(res);
        var listOfId = [];
        for (var i = 0; i < res.length; i++) {
            listOfId.push(res[i]["item_id"]);
        };

        if (res.length !== 0) {
            showSQLTable(res);

            console.log("\n -------------------------------------------------------------------- \n");
            Inquirer.prompt(
                {
                    type: "input",
                    name: "id",
                    message: "What is the ID of the item you would like to delete? [Quit with Q]",
                    validate: function (input) {
                        if (input.toUpperCase() === "Q") {
                            return true;
                        } else if (isNaN(input)) {
                            console.log("\n " + input + " is not a number, please input an id number.")
                            return false;
                        }

                        var check = checkIdInList(parseFloat(input), listOfId);
                        if (check === false) {
                            console.log("\n " + input + " is not in the current list of id numbers.")
                            return false;
                        } else {
                            return true;
                        }
                    }
                }
            ).then(function (userInput) {
                if (userInput["id"].toUpperCase() !== "Q") {
                    var inputID = parseInt(userInput["id"]);
                    // console.log("entered")
                    deleteID(inputID);
                } else {
                    quitApp();
                }
            });
        } else {
            console.log("Sorry no items available.");
            quitApp();
        };
    });

    function deleteID(inputID) {

        connection.query("SELECT * FROM inventory WHERE ?", { item_id: inputID }, function (err, res) {
            if (err) throw err;


            connection.query("DELETE FROM inventory WHERE ?", { item_id: inputID }, function (err, resDelete) {
                if (err) throw err;

                console.log("\n -------------------------------------------------------------------- \n");
                console.log("You have successfully deleted the following: ");
                showSQLTable(res);

                start();
            });

        });
    }


};

function checkIdInList(input, listOfId) {
    var checkID = false;
    for (var j = 0; j < listOfId.length; j++) {
        if (input === listOfId[j]) {
            checkID = true;
        }
    };
    return checkID;
};

function checkIfNumbNegative(input) {
    if (input.toUpperCase() === "Q") {
        return true;
    } else if (input < 0) {
        console.log("\n Error: Unable to process due to negative value.");
        return false;
    } else if (isNaN(input)) {
        console.log("\n Error: " + input + " is not a number, please enter a number.");
        return false;
    } else {
        return true;
    }
}

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
    var coloredKeys = [];
    for (var i = 0; i < keys.length; i++) {
        // coloredKeys.push(Colors.yellow(keys[i]));
        coloredKeys.push((keys[i]).sqlHeaders);
    }

    var table = new Table({
        head: coloredKeys
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
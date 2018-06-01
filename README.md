# Bamazon :globe_with_meridians:

A shopping application utilizing node.js and a SQL database.

## Examples of App :tv:
Please see "Getting Started" section for prerequisites and installations.

Bamazon Customer:
![demo](/assets/BamazonCustomer.gif)

Bamazon Manager (Part 1):
![demo](/assets/BamazonManager_part1.gif)

Bamazon Manager (Part 2):
![demo](/assets/BamazonManager_part2.gif)

Bamazon Supervisor:
![demo](/assets/BamazonSupervisor.gif)

## Getting Started :loudspeaker:
This repo utilizes various packages from Node Package Manager(NPM).

### Prerequisites :zap:
1. Please ensure node.js is install, node.js is required to install packages from NPM. You can download the program at:

    https://nodejs.org/en/download/

2. SQL is required to run queries as well as a SQL Server to retain data:

    https://www.mysql.com/

### Instructions :clipboard:

1. In your terminal navigate to your specified folder, type the following to install all required packages listed in package.json:
    ```
    npm install
    ```

2. Run the file labeled "schema.sql" to create a new database and tables for queries to provide data.

3. A) You may either create a .env file with the following information OR (apply section B):

    You may need to update the information after "=" based on your SQL server connection.

    ```
    MYSQL_HOST=localhost
    MYSQL_PORT=3306
    MYSQL_USER=root
    MYSQL_KEY=password
    ```

    B) The much longer route avoiding "step A", is to update the top portion of each javascript file with the following based on your SQL server connection. The variable "database" does not need to be updated, and will be created when "schema.sql" is run.
    ```
    var connection = Mysql.createConnection({
        host: "localhost",
        port: 3306,
        user: "root",
        password: "password",

        database: "bamazon_DB"
    });
    ```

4. Have fun running each of the js file by writing in terminal!
    ```
    node bamazonCustomer.js
    ```
    ```
    node bamazonManager.js
    ```
    ```
    node bamazonSupervisor.js
    ```

    
## Built With :hammer:
* [Javascript](https://www.javascript.com/) - An object-oriented computer programming language.
* [Node.js](https://nodejs.org/en/) - A javascript library with various packages.
* [NPM - Inquire](https://www.npmjs.com/package/inquirer) - A node package for retrieving user input.
* [NPM - MySQL](https://www.npmjs.com/package/mysql) - A node package for retrieving/updating data from a SQL server.
* [NPM - CLI Table 2](https://www.npmjs.com/package/cli-table2) - A node package for rendering arrays into tables.
* [NPM - Colors](https://www.npmjs.com/package/colors) - A node package for custom colors and styles.
* [NPM - Dotenv](https://www.npmjs.com/package/dotenv) - A node package to help store sensitive information.

## Authors :squirrel: 
* **Eric Ng** [EricNg314](https://github.com/EricNg314)

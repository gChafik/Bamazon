let mysql = require("mysql");
let inquirer = require("inquirer");

let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
});

connection.connect(function(err){
    if (err) throw err;
    searchDB();
});

function searchDB(){
    inquirer.prompt(
        {
            name: "action",
            type: "list",
            message: "What would you like to do?",
            choices: [
                "View Products for Sale",
                "View Low Inventory",
                "Add to Inventory",
                "Add New Product",
                "exit"
            ]
        }
)
.then(function(answer){
    switch (answer.action) {
        case "View Products for Sale":
            displayItems();
            break;
        case "View Low Inventory":
            viewLowInv();
            break;
        case "Add to Inventory":
            addInv();
            break;
        case "Add New Product":
            addNewProduct();
            break;

        case "exit":
            connection.end();
            break;
    }
    });
};

function displayItems(){
    connection.query("SELECT * FROM PRODUCTS", function(err, res){
        if (err) throw err;
        console.log(res);
        connection.end();
    });
};

function viewLowInv(){
    connection.query("SELECT * FROM PRODUCTS WHERE STOCK_QUANTITY < 5", function(err, res){
        if (err) throw err;
        console.log(res);
        connection.end();
    });
};

function addInv(){
    inquirer
    .prompt([
        {name: "item",
        type: "input",
        message: "Enter the product item_id you would like to update"
        },
        {
            name: "quantity",
            type: "input",
            message: "Enter the quantity you would like to add"
        }
    ])
    .then(function(answer){

        connection.query("SELECT * FROM PRODUCTS WHERE ?", {item_id: answer.item}, function(err, res){
            if (err) throw err;
            console.log(res);
            console.log("Stock Quantity: ", res[0].stock_quantity);

            connection.query("UPDATE PRODUCTS SET ? WHERE ?",
            [{
                stock_quantity: parseInt(answer.quantity) + res[0].stock_quantity
            },
            {
                item_id: answer.item
            }],
            function(err){
                if (err) throw err;
                console.log("The item stock quantity was updated successfully!");
                searchDB();
            }
            );
        });
    });
};

function addNewProduct(){
    inquirer
    .prompt([
        {
            name: "product_name",
            type: "input",
            message: "Enter a product name"
        },
        {
            name: "department",
            type: "input",
            message: "Enter a department"
        },
        {
            name: "price",
            type: "input",
            message: "Enter a price"
        },
        {
            name: "quantity",
            type: "input",
            message: "Enter a quanity"
        }
    ])
    .then(function(answer){
        connection.query("INSERT INTO PRODUCTS SET ?",
        {
            product_name: answer.product_name,
            department_name: answer.department,
            price: answer.price,
            stock_quantity: answer.quantity
        },
        function(err){
            if (err) throw err;
            console.log("The new product was added to inventory successfully!")
            connection.end();
        }
        );
    });
};
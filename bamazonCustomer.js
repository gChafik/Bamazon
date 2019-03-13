let mysql = require ("mysql");
let inquirer = require ("inquirer");

let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
});

connection.connect(function(err){
    if (err) throw err;
    displayItems();
    placeOrder();
});

function displayItems(){
    connection.query("SELECT * FROM PRODUCTS", function(err, res){
        if (err) throw err;
        console.log(res);
        //connection.end();
    });
}
function placeOrder(){
    inquirer.prompt([{
        name: "item_id",
        type: "input",
        message: "Please enter the product ID you would like to purchase"
    },
    {
        name: "quantity",
        type: "input",
        message: "How many units would you like to buy?"
    }
    ])
    .then(function(answer){
    connection.query("SELECT * FROM PRODUCTS WHERE ?", {item_id: answer.item_id},function(err, res){
        if (err) throw err;
        console.log("Stock Quantity : ", res[0].stock_quantity);
        console.log("User Input: ", answer.quantity);
        console.log("Price: ", res[0].price);
        if(answer.quantity > res[0].stock_quantity){
            console.log("Insufficient quantity!")
            connection.end();
        }
        else{
            console.log("Total Cost of Purchase: ", answer.quantity * res[0].price);

            //update product table
            let new_stock_quantity = res[0].stock_quantity - answer.quantity;
            connection.query("UPDATE PRODUCTS SET ? WHERE ?", 
                [{
                    stock_quantity : new_stock_quantity
                },
                {
                    item_id : res[0].item_id
                }],
                function(err){
                    if (err) throw err;
                    console.log("Order placed successfully!");
                }
            );
            
            //update product sales
            connection.query("UPDATE PRODUCTS SET ? WHERE ?", 
                [{
                    product_sales : res[0].price * answer.quantity;
                },
                {
                    item_id : res[0].item_id
                }],
                function(err){
                    if (err) throw err;
                    console.log("Product sales column has been updated successfully!");
                }
            );

            connection.end();
        }
    });
});

}

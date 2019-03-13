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
    supView();
});

function supView(){
    inquirer.prompt(
        {
            name: "action",
            type: "list",
            message: "What would you like to do?",
            choices: [
                "View Product Sales by Department",
                "Create New Department",
                "exit"
            ]
        }
)
.then(function(answer){
    switch (answer.action) {
        case "View Product Sales by Department":
            viewProductSales();
            break;
        case "Create New Department":
            createDepartment();
            break;
        case "exit":
            connection.end();
            break;
    }
    });
};

function viewProductSales(){
    let query = "select d.department_id, d.department_name, SUM( d.over_head_costs) AS over_head_costs,";
    query += "SUM(p.product_sales) AS  product_sales,"; 
    query += "SUM((p.product_sales - d.over_head_costs)) AS 'total_profit'";
    query += "from departments d";
    query += "inner join products p";
    query += "on d.department_name = p.department_name";
    query += "GROUP BY DEPARTMENT_NAME, department_id";
    query += "ORDER BY DEPARTMENT_ID";

    connection.query(query, function(err, res){
        if (err) throw err;
        console.log(res);
        connection.end();
    });
};

function createDepartment(){
    inquirer
    .prompt([
        {
            name: "department_name",
            type: "input",
            message: "Enter a department name"
        },
        {
            name: "over_head_costs",
            type: "input",
            message: "Enter a overhead cost"
        }
    ])
    .then(function(answer){
        connection.query("INSERT INTO DEPARTMENTS SET ?",
        {
            department_name: answer.department_name,
            over_head_costs: answer.over_head_costs
        },
        function(err){
            if (err) throw err;
            console.log("The new department was added successfully!")
            connection.end();
        }
        );
    });
};
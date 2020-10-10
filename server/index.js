const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const routing = require('./routing.js');
const api = require('./api.js');
const session = require("express-session");

const MongoClient = require("mongodb").MongoClient;

// создаем объект MongoClient и передаем ему строку подключения
const mongoClient = new MongoClient("mongodb://localhost:27017/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const app = express();

app.use(
    session({
        secret: "ds3459345kFOPW{",
        saveUninitialized: true,
        resave: false,
    })
);

// Настраиваем возможность принимать от клиента данные в формате JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

let db;
mongoClient.connect((err, client) => {
    if (err){
        return console.log(err);
    }
    db = client.db('todo');

    routing(app, db);
    api(app, db);

    app.use("/", express.static(path.join(__dirname,"../assets")));

    // запускаем сервер на 3000 порту
    app.listen(3000, () => {
        console.log("http://localhost:3000/");
    });
});
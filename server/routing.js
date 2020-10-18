const fs = require("fs");
const path = require("path");
const { Db } = require("mongodb");

/** 
 * @param {import('mongodb').Db} db
 */

module.exports = function (app, db) {
    // обрабатываем запрос стартовой страницы. app.get - настраивает запросы на получение на данных
    app.get("/", (req, res) => {
        if (!req.session.user) {
            res.redirect('/login/');
            return;
        }
        // читаем файл index.html
        const html = fs
            .readFileSync(path.join(__dirname, "../assets/index.html"))
            .toString().replace('{{log}}', `<div>Вы вошли как: <span style="font-style: italic; font-weight: bold; font-size: 20px; color: rgb(124, 133, 255);">${req.session.user.login}</span></div>`);;

        // говорим, что ответом будет документ в формате html
        res.setHeader("Content-Type", "text/html");

        // отсылаем документ клиенту
        res.end(html);
    });

    app.get("/login/", (req, res) => {
        // читаем файл index.html
        let html = fs
            .readFileSync(path.join(__dirname, "../assets/login/index.html"))
            .toString();

        if (req.session.invalidLoginPassword) {
            delete req.session.invalidLoginPassword;
            html = html.replace('{{message}}', '<div class="row invalid">Не правильный логин и пароль</div>');
        }
        else {
            html = html.replace('{{message}}', '');
        }

        // говорим, что ответом будет документ в формате html
        res.setHeader("Content-Type", "text/html");

        // отсылаем документ клиенту
        res.end(html);
    });

    app.post("/login/", async (req, res) => {
        const login = req.body.login;
        const password = req.body.password;

        const users = db.collection('users');

        const user = await users.findOne({login: login, password: password});

        if (user) {
            req.session.user = user;
            res.redirect("/");
        }
        else {
            req.session.invalidLoginPassword = true;
            res.redirect("/login/");
        }
    });

    app.get("/registration/", (req, res) => {
        // читаем файл index.html
        let html = fs
            .readFileSync(path.join(__dirname, "../assets/registration/index.html"))
            .toString();

        if (req.session.passwordsMissmatch) {
            delete req.session.passwordsMissmatch;
            html = html.replace('{{message}}', '<div class="row invalid">Пароли не совпадают</div>');
        }
        else if (req.session.existingUser) {
            delete req.session.existingUser;
            html = html.replace('{{message}}', '<div class="row invalid">Пользователь с таким логином уже существует</div>');
        }
        else if (req.session.emptyLoginPassword) {
            delete req.session.emptyLoginPassword;
            html = html.replace('{{message}}', '<div class="row invalid">Не указан логин или пароль</div>');
        }
        else {
            html = html.replace('{{message}}', '');
        }

        // говорим, что ответом будет документ в формате html
        res.setHeader("Content-Type", "text/html");

        // отсылаем документ клиенту
        res.end(html);
    });

    app.post("/registration/", async (req, res) => {
        const login = req.body.login;
        const password = req.body.password;
        const passwordRepeat = req.body['password-repeat'];

        const users = db.collection('users');
        const user = await users.findOne({login: login});

        if (password !== passwordRepeat) {
            req.session.passwordsMissmatch = true;
            res.redirect('/registration/');
            return;
        }
        else if (user) {
            req.session.existingUser = true;
            res.redirect('/registration/');
            return;
        }
        else if (!login || !password) {
            req.session.emptyLoginPassword = true;
            res.redirect('/registration/');
            return;
        }
        else {
            const result = await users.insertOne({login: login, password: password});
            const user = result.ops[0];

            db.collection('data');
            // data.insertOne({userID: user._id}); //как сделать правильно?
            
            req.session.user = user;
            
            res.redirect("/");
        }
    });

    app.post("/logout/", (req, res) => {
        delete req.session.user;
        res.redirect('/login/');
    });
};
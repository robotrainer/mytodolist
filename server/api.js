const ObjectId = require('mongodb').ObjectId;

/**
 * 
 * @param {import('mongodb').Db} db 
 */

module.exports = function (app, db) {
    app.get("/get-todos", async (req, res) => {
        const todos = await loadData(req.session.user._id);
        const todosList = await todos.find({userID: ObjectId(req.session.user._id)}).toArray();
        res.setHeader("Content-Type", "application/json");
        res.send(todosList);
    });

    app.post('/add', async (req, res) => {
        const todos = await loadData(req.session.user._id);
        const list = req.body;
        await saveData(req.session.user._id, list.title, list.completed);
        const todosList = await todos.find({userID: ObjectId(req.session.user._id)}).toArray();
        res.send('ok');
    });

    app.post('/remove', async (req, res) => {
        const data = await loadData(req.session.user._id);
        const todoid = req.body;
        for (let i = 0; i < todoid.length; i++) {
            await data.deleteOne({_id: ObjectId(todoid[i])});
        }
        res.send('ok');
    });

    app.post('/check-all', async (req, res) => {
        const todos = await loadData(req.session.user._id);
        const check_all = req.body;
        if(check_all.check_all){
            await todos.updateMany({userID: ObjectId(req.session.user._id)}, {$set: {completed: false}});
        }
        else{
            await todos.updateMany({userID: ObjectId(req.session.user._id)}, {$set: {completed: true}});
        }
        res.send('ok');
    });

    app.post('/toggle', async (req, res) => {
        const data = await loadData(req.session.user._id);
        const idToggleTodo = req.body.number;
        const todo = await data.findOne({_id: ObjectId(idToggleTodo)});
        await data.updateOne({_id: ObjectId(idToggleTodo)}, {$set: {completed: !todo.completed}});
        res.send('ok');
    });

    // app.post('/clear', async (req, res) => {
    //     let data = await loadData(req.session.user._id);
    //     data = data.filter((x) => !x.completed);
    //     await saveData(req.session.user._id, data);
    //     res.send('ok');
    // });

    async function loadData(id) {
        const todos = db.collection('data');
        return todos;
    }
    
    async function saveData(id, title, completed) {
        const todos = db.collection('data');
        await todos.insertOne({userID: ObjectId(id), title: title, completed: completed});
    }
};


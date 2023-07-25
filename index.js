import 'dotenv/config';
import express from "express";
import bodyParser from "body-parser";
import _ from "lodash";
import mongoose from "mongoose";
mongoose.connect("mongodb+srv://" + process.env.DB_USER + ":" + process.env.DB_PASS + "@cluster0.ze4y6ft.mongodb.net/TodolistDB");

const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const itemsSchema = new mongoose.Schema({
    name: String
});
const Item = mongoose.model('Item', itemsSchema);

// const listSchema = new mongoose.Schema({
//     name: String,
//     items: [itemsSchema]
// });

// const List = mongoose.model('List', listSchema);

const item1 = new Item({
    name: "Welcome to your to do list!"
});

const item2 = new Item({
    name: "Click '+' to add a task"
});

const item3 = new Item({
    name: "To delete check the box!"
});

const defaultItems = [item1, item2, item3]

app.get("/", (req, res) => {
    Item.find()
        .then((items) => {
            if (items.length === 0) {
                Item.insertMany(defaultItems)
                    .then((err) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("success");
                        }
                    });
                res.redirect("/");
            } else {
                console.log(items.length);
                res.render("index.ejs", { newListItems: items, itemName: req.body.newItem });
            }
        });
});

app.post("/", (req, res) => {
    const itemName = req.body.newItem;
    const newItem = new Item({
        name: itemName
    });
    newItem.save();
    res.redirect("/");
});

app.post("/delete", (req, res) => {
    const checkedItem = req.body.checkbox;
    Item.deleteOne({ _id: checkedItem })
        .then(function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("success");
            }
        });
    res.redirect("/");
})








app.listen(port, () => {
    console.log(`port ${port} up and running!`);
})
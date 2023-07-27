import 'dotenv/config';
import express from "express";
import bodyParser from "body-parser";
import _ from "lodash";
import mongoose from "mongoose";
mongoose.connect("mongodb+srv://" + process.env.DB_USER + ":" + process.env.DB_PASS + "@cluster0.ze4y6ft.mongodb.net/TodolistDB");

const app = express();
const port = 3000;
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const itemsSchema = new mongoose.Schema({
    name: String
});
const Item = mongoose.model('Item', itemsSchema);

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

const List = mongoose.model('List', listSchema);

const item1 = new Item({
    name: "Modo de uso: Escribi tu nombre al final de la url"
});

const item2 = new Item({
    name: "Importante! Agregar \"/\" antes de tu nombre"
});

const item3 = new Item({
    name: "Ejemplo: \"https://url/fio\""
});

const defaultItems = [item1, item2, item3]
const newListName = "";

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
                // console.log(items.length);
                res.render("index", { listName: newListName, newListItems: items });
            }
        });
});

app.post("/", (req, res) => {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const newItem = new Item({
        name: itemName
    });
    if (listName === newListName) {
        newItem.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName })
            .then((foundList) => {
                foundList.items.push(newItem);
                foundList.save();
                res.redirect("/" + listName);
            });
    }
});

app.post("/delete", (req, res) => {
    const checkedItem = req.body.checkbox;
    const listName = req.body.listName;

    Item.deleteOne({ _id: checkedItem })
        .then(function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("success");
            }
        });

    if (listName === newListName) {
        res.redirect("/");
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItem } } })
            .then(function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('successful redirect');
                }
                res.redirect("/" + listName);
            })

    }
});

app.get("/:customListName", (req, res) => {
    const customListName = _.kebabCase(req.params.customListName);

    List.findOne({ name: customListName })
        .then(function (foundList) {
            if (!foundList) {
                const newList = new List({
                    name: customListName,
                    items: defaultItems
                });
                newList.save();
                res.redirect("/" + customListName);

            } else {
                res.render("index", { listName: foundList.name, newListItems: foundList.items });
            }
        });
});







app.listen(port, () => {
    console.log(`port ${port} up and running!`);
})
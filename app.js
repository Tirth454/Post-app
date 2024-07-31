const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const userModel = require("./models/user");
const path = require("path");
const bcrypt = require("bcrypt");
const postModel = require("./models/post");
const jwt = require("jsonwebtoken");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.render("index", { message: " " });
});

app.post("/create", async (req, res) => {
    let { username, email, age, password } = req.body;

    let user = await userModel.findOne({ email });
    if (user) {
        res.render("index", { message: "User already exists" });
    } else {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
                let user = userModel.create({
                    username,
                    email,
                    age,
                    password: hash,
                });
            });
        });
        res.render("loginpage", { loginmessage: "User Created" });
    }
});

app.get("/login", (req, res) => {
    res.render("loginPage", { loginmessage: " " });
});

app.post("/checkuser", async (req, res) => {
    let user = await userModel.findOne({ email: req.body.EnteredEmail });
    if (!user) {
        res.render("loginpage", { loginmessage: "User Not Found" });
    } else {
        bcrypt.compare(req.body.EnteredPass, user.password, (err, result) => {
            if (result) {
                let token = jwt.sign(
                    { email: user.email, userid: user._id },
                    "shhhhh",
                );
                res.cookie("token", token);
                res.redirect("/profile");
            } else {
                res.render("loginpage", { loginmessage: "Incorrect Password" });
            }
        });
    }
});

app.get("/profile", isLoggedin, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email });
    await user.populate("posts");
    res.render("profile", { user });
});
function isLoggedin(req, res, next) {
    if (req.cookies.token === "")
        res.render("loginpage", { loginmessage: " something Went Wrong" });
    else {
        let data = jwt.verify(req.cookies.token, "shhhhh");
        req.user = data;
        next();
    }
}
app.post("/createPost", isLoggedin, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email });
    let post = await postModel.create({
        user: user._id,
        content: req.body.content,
    });
     user.posts.push(post._id);
     await user.save();
     res.redirect("/profile")
});

app.get("/logout", (req, res) => {
    res.cookie("token", " ");
    res.render("loginpage", { loginmessage: " " });
});



app.listen(3000, (err) => {
    if (err) console.error(err);
    else console.log("Listining at http://localhost:3000");
});

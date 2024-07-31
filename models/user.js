const mongoose = require("mongoose");

mongoose.connect(
    `mongodb+srv://tirthratanpara454:tirth1234@tirth.1w8atvn.mongodb.net/tirth`
);

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "post",
        },
    ],
});

module.exports = mongoose.model("user", userSchema);

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const createError = require('../utils/error')


module.exports.register = async (req, res) => {
    const { username, password, email } = req.body;
    const newUser = new User({ username, password, email });
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);
    try {
        await newUser.save();
        res.status(200).send("User registered successfully");
    } catch (err) {
        next(err);
    }
}

module.exports.login = async (req, res, next) => {
    const { username, password } = req.body;
    console.log(username,password)
    try {
        const user = await User.findOne({ username });
        console.log(user)
        if (!user) return next(createError(404, "User not found"));
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) return next(createError(400, "Invalid credentials"));
        const { password: pass, ...data } = user._doc;
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
}

module.exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findOne({username:req.query.username})
        if (user){
            res.status(200).send("Username already exists, please Login to continue, or choose a different username");
        }
        else{
            res.status(200).send("Username is available");
        }
    } catch (err) {
        next(err);
    }
}
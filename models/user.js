const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userScheme = new mongoose.Schema({
        username: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error('Invalid email address');
                }
            }
        },
        password: {
            type: String,
            required: true,
        },
        tokens: [{
            token: {
                type: String,
                required: true
            }
        }]
    })
    //Methods

userScheme.statics.findByCredentials = async(email, password) => {
    const user = await User.findOne({ "email": email });
    if (!user) {
        console.log(email)
        throw new Error('User does not exist');
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error('Unable to login');
    }

    return user;
}

userScheme.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign({ _id: user._id }, 'randomSecretKey');

    user.tokens = user.tokens.concat({ token });

    await user.save();

    return token;

}

userScheme.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject()

    delete userObject.password;
    delete userObject.tokens;

    return userObject;
}

//Middleware
userScheme.pre('save', async function(next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next()
});

const User = mongoose.model('User', userScheme)

module.exports = User;
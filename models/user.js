const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Repo = require('./repo')
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
        collegeName: {
            type: String,
            required: true,
        },
        desc: {
            type: String,
            required: true,
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
        }],
        profile_photo: {
            type: Buffer,
        }
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

userScheme.virtual('repos', {
    ref: 'Repo',
    localField: '_id',
    foreignField: 'author'
});

userScheme.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

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
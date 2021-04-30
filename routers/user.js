const express = require('express');
const User = require('../models/user');
const Repos = require('../models/repo')
const router = new express.Router();
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');

const upload = multer({
    limits: {
        fileSize: 8000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/)) {
            cb(new Error('File must have a jpg,jpeg or png'));
        }

        cb(undefined, true);
    }
})

router.get('/', (req, res) => {
    res.send({
        "documentation": "https://documenter.getpostman.com/view/13305175/TzK15ZxT"
    });
});

router.post('/users/me/upload', auth, upload.single('profile_photo'), async(req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 160, height: 160 }).png().toBuffer();

    req.user.profile_photo = buffer;
    await req.user.save();
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.post('/users/me/deletePhoto', auth, async(req, res) => {
    req.user.profile_photo = undefined;
    req.user.save();
    res.send("deleted image")
});

router.post('/users', async(req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (e) {
        console.log(e)
        res.status(400).send(e);
    }

});

router.post('/users/login', async(req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});

router.post('/users/logout', auth, async(req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send(error);
    }
})

router.patch('/users/me', auth, async(req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['username', 'email', 'password'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates' });
    }

    try {

        updates.forEach((update) => req.user[update] = req.body[update]);
        await req.user.save();
        res.send(req.user);
    } catch (e) {
        res.status(500).send();
    }
});

router.delete('/users/me', auth, async(req, res) => {
    try {
        await req.user.remove()
        res.send(req.user);
    } catch (e) {
        res.status(500).send();
    }
});

router.get('/users', async(req, res) => {
    try {
        const users = await User.find({});
        res.send(users);

    } catch (e) {
        res.status(500).send(e);
    }

});

router.get('/users/myprofile', auth, async(req, res) => {
    res.send(req.user);

});

router.get('/users/myImage', auth, async(req, res) => {
    if (req.user.profile_photo) {
        res.set('Content-type', 'image/png')
        return res.send(req.user.profile_photo);
    } else
        return res.status(400).send({ "message": "User has not uploaded image" })

});


router.get('/user/myRepos', auth, async(req, res) => {

    await req.user.populate('repos').execPopulate();
    res.send(req.user.repos);

});

router.get('/users/:id', auth, async(req, res) => {
    const _id = req.params.id;

    try {
        const user = await User.findById({ _id });
        if (!user) {
            return res.status(404).send();
        }
        res.send(user);
    } catch (e) {
        res.status(500).send(e);

    }

});

router.get('/users', async(req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    } catch (e) {
        res.status(500).send(error);
    }
});


module.exports = router
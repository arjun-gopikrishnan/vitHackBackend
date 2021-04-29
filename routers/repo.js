const express = require('express');
const Repo = require('../models/repo');
const router = new express.Router();
const auth = require('../middleware/auth')

router.get('/repos/:id', async(req, res) => {
    const _id = req.params.id;

    try {
        const repo = await Repo.findById({ _id });
        await repo.populate('author').execPopulate();
        console.log(repo.author)
        res.send(repo);

    } catch (e) {
        res.status(500).send(e);
    }

});

// router.patch('/repo/:id', async(req, res) => {
//     const updates = Object.keys(req.body);
//     const allowedUpdates = ['name', 'content', 'author', 'date'];
//     const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

//     if (!isValidOperation) {
//         return res.status(400).send({ error: 'Invalid updates' });
//     }

//     try {
//         const post = await Post.findById(req.params.id);
//         updates.forEach((update) => post[update] = req.body[update]);
//         await post.save();
//         if (!post) {
//             return res.status(404).send();
//         }
//         res.send(post);
//     } catch (e) {
//         res.status(500).send();
//     }
// });

router.get('/repos', async(req, res) => {
    try {
        const repos = await Repo.find({});
        res.send(repos);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.post('/repo', auth, async(req, res) => {
    const repo = new Repo({
        ...req.body,
        author: req.user._id
    });

    try {
        await repo.save();
        res.status(201).send(repo);
    } catch (e) {
        res.status(400).send(e);
    }

});

router.delete('/repos/:id', async(req, res) => {
    try {
        const repo = await Repo.findByIdAndDelete(req.params.id);
        if (!repo) {
            return res.status(404).send();
        }
        res.send(repo);
    } catch (e) {
        res.status(500).send();
    }
});


module.exports = router
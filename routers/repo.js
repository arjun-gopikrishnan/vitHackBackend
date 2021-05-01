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

router.get('/getrepoByname/:name', async(req, res) => {
    const name = req.params.name;

    try {
        const repo = await Repo.findOne({ courseName: name });
        res.send(repo);

    } catch (e) {
        res.status(500).send(e);
    }

});

router.get('/getrepoBytags/:tag', async(req, res) => {
    const tag = req.params.tag;

    try {
        const repo = await Repo.find({ tags: tag });
        res.send(repo);

    } catch (e) {
        res.status(500).send(e);
    }

});

router.patch('/repo/:id', auth, async(req, res) => {
    const updates = Object.keys(req.body);
    console.log(updates)
    const allowedUpdates = ['courseName', 'courseDesc', 'topicInfo', 'courseLinks', 'tags'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates' });
    }

    try {
        const repo = await Repo.findById({ _id: req.params.id, owner: req.user_id });
        updates.forEach((update) => repo[update] = req.body[update]);
        await repo.save();
        if (!repo) {
            return res.status(404).send();
        }
        res.send(repo);
    } catch (e) {
        console.log(e)
        res.status(500).send(e);
    }
});

router.patch('/repo/topicUpdate/:index/:id', auth, async(req, res) => {
    const updates = req.body;
    const index = req.params.index;

    try {
        const repo = await Repo.findById({ _id: req.params.id, owner: req.user_id });
        length = repo.topicInfo.length;
        if (index > length - 1)
            return res.status(400).send({ "Message": "Index doesn't exist" });


        repo.topicInfo[index] = updates;
        await Repo.findByIdAndUpdate({ _id: req.params.id }, repo);
        const updatedRepo = await Repo.findById({ _id: req.params.id, owner: req.user_id });
        res.send(updatedRepo)

    } catch (e) {
        console.log(e)
        res.status(500).send(e);
    }
});

router.patch('/repo/topicAppend/:id', auth, async(req, res) => {
    const updates = req.body;

    try {
        const repo = await Repo.findById({ _id: req.params.id, owner: req.user_id });
        repo.topicInfo.push(updates);
        await Repo.findByIdAndUpdate({ _id: req.params.id }, repo);
        const updatedRepo = await Repo.findById({ _id: req.params.id, owner: req.user_id });
        res.send(updatedRepo)

    } catch (e) {
        console.log(e)
        res.status(500).send(e);
    }
});

router.patch('/repo/topicDelete/:index/:id', auth, async(req, res) => {
    const index = req.params.index;

    try {
        const repo = await Repo.findById({ _id: req.params.id, owner: req.user_id });
        length = repo.topicInfo.length;
        if (index > length - 1)
            return res.status(400).send({ "Message": "Index doesn't exist" });

        repo.topicInfo.splice(index, 1)
        await Repo.findByIdAndUpdate({ _id: req.params.id }, repo);
        const updatedRepo = await Repo.findById({ _id: req.params.id, owner: req.user_id });
        res.send(updatedRepo);

    } catch (e) {
        console.log(e)
        res.status(500).send(e);
    }
});

router.patch('/repo/courseUpdate/:index/:id', auth, async(req, res) => {
    const updates = req.body;
    const index = req.params.index;

    try {

        const repo = await Repo.findById({ _id: req.params.id, owner: req.user_id });

        length = repo.courseLinks.length;
        if (index > length - 1)
            return res.status(400).send({ "Message": "Index doesn't exist" });


        repo.courseLinks[index] = updates;
        await Repo.findByIdAndUpdate({ _id: req.params.id }, repo);
        const updatedRepo = await Repo.findById({ _id: req.params.id, owner: req.user_id });
        res.send(updatedRepo)

    } catch (e) {
        console.log(e)
        res.status(500).send(e);
    }
});

router.patch('/repo/courseAppend/:id', auth, async(req, res) => {
    const updates = req.body;

    try {
        const repo = await Repo.findById({ _id: req.params.id, owner: req.user_id });
        repo.courseLinks.push(updates);
        await Repo.findByIdAndUpdate({ _id: req.params.id }, repo);
        const updatedRepo = await Repo.findById({ _id: req.params.id, owner: req.user_id });
        res.send(updatedRepo)

    } catch (e) {
        console.log(e)
        res.status(500).send(e);
    }
});

router.patch('/repo/courseDelete/:index/:id', auth, async(req, res) => {
    const index = req.params.index;

    try {
        const repo = await Repo.findById({ _id: req.params.id, owner: req.user_id });
        length = repo.courseLinks.length;
        if (index > length - 1)
            return res.status(400).send({ "Message": "Index doesn't exist" });

        repo.courseLinks.splice(index, 1)
        await Repo.findByIdAndUpdate({ _id: req.params.id }, repo);
        const updatedRepo = await Repo.findById({ _id: req.params.id, owner: req.user_id });
        res.send(updatedRepo);

    } catch (e) {
        console.log(e)
        res.status(500).send(e);
    }
});

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
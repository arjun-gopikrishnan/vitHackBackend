const express = require('express');

require('../db/mongoose');

const userRouter = require('../routers/user')

const app = express();

const port = process.env.PORT;

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.json());

app.use(userRouter);

app.listen(port, () => {
    console.log('Server active on port ' + port);
});
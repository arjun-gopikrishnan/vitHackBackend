const express = require('express');

require('../db/mongoose');

const userRouter = require('../routers/user')
const repoRouter = require('../routers/repo');

const app = express();

const port = process.env.PORT;

const cors = require('cors')
app.use(cors())
app.options('*', cors())


app.use(express.json());

app.use(userRouter);
app.use(repoRouter);


app.listen(port, () => {
    console.log('Server active on port ' + port);
});
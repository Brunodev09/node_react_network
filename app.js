const express = require('express'),
app = express();
const bodyParser = require('body-parser');

// Bodyparsers middleware
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

const users = require('./routes/api/user');
const posts = require('./routes/api/post');
const profiles = require('./routes/api/profile');

// MongoDB settings and connection
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/reactApp")
    .then(() => console.log('MongoDB is up and running...'))
    .catch((ex) => console.log(ex));

const port = process.env.PORT || 3000;

//Routes 
app.get('/', (req, res) => {
    res.send('Working');
});

//Middlewares
app.use('/api/users', users);
app.use('/api/posts', posts);
app.use('/api/profiles', profiles);

app.listen(port, () => {
    console.log('Server is running on port ' + port);
});
const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

// Load user Model
const UserModel = require('../../models/User');

// @route GET api/user/test
// @desc Tests user route
// @access Public

router.get('/test', (req, res) => {
    res.json({msg: "Users works!"});
});

// @route POST api/user/register
// @desc Register a user
// @access Public

router.post('/register', (req, res) => {
    UserModel.findOne({ email: req.body.email })
    .then((user) => {
        if (user) {
            return res.status(400).json({email: 'Email already in use.'});
        } else {
            const avatar = gravatar.url(req.body.email, {
                s: '200', // size
                r: 'pg', // rating
                d: 'mm' // default
            });
            const user_object = {
                name: req.body.name,
                email: req.body.email,
                avatar: avatar,
                password: req.body.password
            }
            const newUser = new UserModel(user_object);
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (ex, hash) => {
                    if (ex) throw ex;
                    newUser.password = hash;
                    newUser.save()
                    .then((user) => {
                        res.json(user)
                    })
                    .catch((error) => console.log(error));
                });
            });
        }
    });
});

module.exports = router;
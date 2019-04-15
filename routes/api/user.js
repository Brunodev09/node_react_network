const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken');
const passport = require('passport');

// Load user Model
const UserModel = require('../../models/User');

//Load input validation
const ValidateRegisterInput = require('../../validation/register');


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
    const { errors, isValid } = ValidateRegisterInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

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

// @route POST api/user/login
// @desc Login User / Returning JWT Token
// @access Public
router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    UserModel.findOne({email: email})
    .then((user) => {
        if (!user) {
            return res.status(404).json({email: 'Email not found in database'});
        }

        bcrypt.compare(password, user.password)
        .then((isMatch) => {
            if (isMatch) {
                const payload = {
                    id: user.id,
                    name: user.name,
                    avatar: user.avatar
                };
                // Sign JWT token
                JWT.sign(payload, 'secret_string', { expiresIn: 3600 }, (err, token) => {
                    if (err) return {error: err};
                    res.json({success: true, token: 'Bearer ' + token });
                });
            } else {
                return res.status(400).json({password: 'Password is incorrect for this email!'});
            }
        });
    });
});

// @route POST api/user/current
// @desc Returns current user
// @access Private
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({msg: 'Success', user: req.user});
});


module.exports = router;
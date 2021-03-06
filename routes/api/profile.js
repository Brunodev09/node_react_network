const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load profile Model
const Profile = require('../../models/Profile');
// Load user Model
const User = require('../../models/User');

// @route GET api/profile/test
// @desc Tests profile route
// @access Public

router.get('/test', (req, res) => {
    res.json({msg: "profile works!"});
});


// @route GET api/profile
// @desc Get users profile
// @access Private
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
    .then(profile => {
        if (!profile) {
            errors.noprofile = 'There is no profile associated with this USER_ID';
            return res.status(404).json(errors);
        }
        res.status(200).json(profile);
    }) 
    .catch(ex => {
        console.log(ex);
        return res.status(404).json(ex);
    });
});

// @route POST api/profile
// @desc Create or Update the user profile
// @access Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const errors = {};
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handles) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername) profileFields.githubusername = req.body.githubusername;

    // Skills need to be split into array from CSV data

    if (typeof req.body.skills !== 'undefined') {
        profileFields.skills = req.body.skills.split(',');
    }

    //Social 
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;

    Profile.findOne({ user: req.user.id })
    .then(profile => {
        if (profile) {
            Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true })
            .then(updatedProfile => {
                res.json(updatedProfile);
            });
        }
        else {
            Profile.findOne({ handle: profileFields.handle })
            .then(profile => {
                if (profile) {
                    errors.handle = 'That handle already exists!';
                    res.status(400).json(errors);
                }
                new Profile(profileFields).save()
                .then(savedProfile => {
                    res.json(savedProfile);
                });
            });
        }
    });
});

module.exports = router;
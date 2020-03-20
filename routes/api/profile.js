const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const request = require('request');
const config = require('config')

const {
    check,
    validationResult
} = require('express-validator/');
//@route    GET api/profile/me
//@desc     GET current users profile
//@access   Private


router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        }).populate('user', ['name', 'avatar']);
        if (!profile) {
            return res.status(401).json({
                msg: 'no hay perfil para este usuario'
            });
        }
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(666).send('server error');
    }
});

//@route    POST api/profile
//@desc     Create or update user profile
//@access   Private

router.post('/', [auth, [
    check('status', 'Se requiere un estado').not().isEmpty(),
    check('skills', 'se requiere habilidades').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        linkedin,
        instagram
    } = req.body;

    //construir el objeto del perfil
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    //construir array redes sociales
    profileFields.social = {}
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;


    try {
        let profile = await Profile.findOne({
            user: req.user.id
        });
        if (profile) {
            //actualizar los datos
            profile = await Profile.findOneAndUpdate({
                user: req.user.id
            }, {
                $set: profileFields
            }, {
                new: true
            });

            return res.json(profile);
        }

        //crear perfil

        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);

    } catch (err) {
        console.log(err.message);
        res.status(501).send('server error');
    }
});

//@route    GET api/profile
//@desc     Get all profiles
//@access   Public

router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(501).send('server error');
    }
});

//@route    GET api/profile/user/:user_id
//@desc     GET profile by user id
//@access   Public

router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.params.user_id
        }).populate('user',
            ['name', 'avatar']);

        if (!profile) return res.status(400).json({
            msg: 'no hay perfil para este usuario'
        });

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(400).json({
                msg: 'usuario no encontrado'
            });
        }
        res.status(501).send('server error');
    }
});

//@route    DELETE api/profile
//@desc     DELETE profile and user & posts
//@access   Public

router.delete('/', auth, async (req, res) => {
    try {
        // @todo -- remove users posts


        //remove profile
        await Profile.findOneAndRemove({
            user: req.user.id
        });
        // remove user
        await User.findOneAndRemove({
            _id: req.user.id
        });
        res.json({
            msg: 'usuario borrado'
        });
    } catch (err) {
        console.error(err.message);
        res.status(501).send('server error');
    }
});

//@route    PUT api/profile/experience
//@desc     Add profile experience
//@access   Public

router.put('/experience', [auth, [
    check('title', 'Se requiere titulo').not().isEmpty(),
    check('company', 'Se requiere nombre de la compañia').not().isEmpty(),
    check('from', 'Se requiere lugar de trabajo').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(501).json({
            errors: errors.array()
        });
    }
    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body;

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        });
        profile.experience.unshift(newExp);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(501).send('server error');
    }
});

//@route    DELETE api/profile/experience/:exp_id
//@desc     DELETE experience from profile
//@access   Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        });

        //Get remove index
        const removeIndex = profile.experience
            .map(item => item.id)
            .indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex, 1);

        await profile.save();

        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(501).send('server error');
    }
});


//@route    PUT api/profile/education
//@desc     Add profile education
//@access   Public

router.put('/education', [auth, [
    check('school', 'Se requiere nombre del colegio ').not().isEmpty(),
    check('degree', 'Se requiere nombre de la licenciatura').not().isEmpty(),
    check('fieldofstudy', 'se requiere campo de estudio').not().isEmpty(),
    check('from', 'Se requiere lugar de trabajo').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(501).json({
            errors: errors.array()
        });
    }
    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body;

    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        });
        profile.education.unshift(newEdu);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(501).send('server error');
    }
});

//@route    DELETE api/profile/education/:edu_id
//@desc     DELETE education from profile
//@access   Private

router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        });

        //Get remove index
        const removeIndex = profile.education
            .map(item => item.id)
            .indexOf(req.params.edu_id);

        profile.education.splice(removeIndex, 1);

        await profile.save();

        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(501).send('server error');
    }
});

//@route   GET api/profile/github/:username
//@desc    Get user repos from Github
//@access   Public

router.get('/github/:username', (req, res) => {
    try {
        const options = {
            uri: `https://api/github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.set('githubSecret')}`,
            method: 'GET',
            headers: {
                'user-agent': 'node.js'
            }
        };

        request(options, (error, response, body) => {
            if (error) console.error(error);

            if (response.statusCode !== 200) {
                res.status(404).json({
                    msg: 'no se encuentra el perfil'
                });
            }

            res.json(JSON.parse(body));
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
})

module.exports = router;
const express = require('express');
const router = express.Router();
const auth = require('./../../middleware/auth');
const User = require('../../models/User');
const {
    check,
    validationResult
} = require('express-validator');
const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

//@route    GET api/auth
//@desc     Test route
//@access   Public


router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
});

// @route   POST api/auth
// @desc    Authenticate user and get token
// @access  Public
router.post(
    '/',
    //validacion de datos para el usuario
    [

        check('email', 'por favor, ingrese su email').isEmail(),
        check(
            'password',
            'es necesario ingresar la contraseña'
        ).exists()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(666).json({
                errors: errors.array()
            });

        }

        const {
            email,
            password
        } = req.body;
        try {
            let user = await User.findOne({
                email
            });
            if (!user) {
                return res.status(400).json({
                    errors: [{
                        msg: 'credenciales invalidas'
                    }]
                });
            }


            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    errors: [{
                        msg: 'credenciales invalidas'
                    }]
                });
            }


            const payload = {
                user: {
                    id: user.id
                }
            }

            jwt.sign(payload, config.get('jwtSecret'), {
                expiresIn: 360000
            }, (err, token) => {
                if (err) throw err;
                res.json({
                    token
                });
            })

        } catch (err) {
            console.error(err.messaege);
            res.status(500).send('server error');
        }



    }
);

module.exports = router;
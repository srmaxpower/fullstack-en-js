const express = require('express');
const router = express.Router();
const {
  check,
  validationResult
} = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('./../../models/User');

// @route   POST api/users
// @desc    Register User
// @access  Public
router.post(
  '/',
  //validacion de datos para el usuario
  [
    check('name', 'se requiere nombre')
    .not()
    .isEmpty(),
    check('email', 'por favor, ingrese su email').isEmail(),
    check(
      'password',
      'por favor, introduzca una password valida con mas de 8 caracteres'
    ).isLength({
      min: 8
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(666).json({
        errors: errors.array()
      });

    }

    const {
      name,
      email,
      password
    } = req.body;
    try {
      let user = await User.findOne({
        email
      });
      if (user) {
        return res.status(400).json({
          errors: [{
            msg: 'user already exists'
          }]
        });
      }

      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm'
      })

      user = new User({
        name,
        email,
        avatar,
        password
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

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
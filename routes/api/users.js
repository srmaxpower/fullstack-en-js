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
      //comprobar si el usuario existe,  
      let user = User.findOne({
        email
      });
      if (user) {
        return res.status(400).json({
          errors: [{
            message: 'el usuario existe '
          }]
        });
      }

      //obtener usuarios con gravatar,
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

      //encriptar la password con bcrypt 
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      //y retornar el jsonwebtoken
      const payload = {
        user: {
          id: user.id
        }
      }
      jwt.sign(payload, );


      res.send('usuario registrado');
    } catch (err) {
      console.error(err.message);
      res.status(666).send('no era por ahi');
    }
  }
);

module.exports = router;
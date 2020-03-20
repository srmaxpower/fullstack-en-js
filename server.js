const express = require('express');
const conexionDB = require('./config/db')
const app = express();

//conexion con la base de datos

conexionDB();


//init middleware

app.use(express.json({
    extended: false
}));

app.get('/', (req, res) => res.send('api en funcionamiento'));

//definicion de las rutas

app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`server iniciado en el puerto ${PORT}`));
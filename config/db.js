const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');


const conexionDB = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });
        console.log("base de datos mongo conectada")
    } catch (err) {
        console.error(err.message)
        //proceso de salida por si falla el try
        process.exit(1);
    }
}

module.exports = conexionDB;
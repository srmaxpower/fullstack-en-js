const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('api en funcionamiento'))

const PORT = process.env.PORT || 9700

app.listen(PORT, () => console.log(`server iniciado en el puerto ${PORT}`));
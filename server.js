const dotenv = require('dotenv');
dotenv.config({path: './config.env'});
const mongoose = require('mongoose');
const app = require('./app');

process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    process.exit(1);
})

//region MONGODB
const DB = process.env.DB;
const uri = DB.replace('<PASSWORD>', process.env.DB_PASSWORD);
//endregion


mongoose.connect(uri).then(() => {
    console.log('DB connection successful');

})

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    server.close(() => {

        process.exit(1);
    })
})



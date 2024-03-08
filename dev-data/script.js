const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');
const Tour = require('../models/tour');
//region MONGODB
const DB = process.env.DB;
const uri = DB.replace('<PASSWORD>',process.env.DB_PASSWORD);
//endregion

const data = require('./data/tours-simple.json');



mongoose.connect(uri).then(() => {
    console.log('DB connection successful');
})


const importData =async ()=>{
try{

    await Tour.deleteMany();
}
catch(error){

}
    try {
        await Tour.create(data);
        console.log('Data successfully loaded');
    } catch (error) {
        console.log(error);
    }
    process.exit();
}
importData()
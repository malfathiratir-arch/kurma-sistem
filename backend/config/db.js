const sqlite3 = reqire('sqlite3').verbose();
const mongoose = reqire('mongoose');

const dbSqlite = new sqlite3.Database('./database.sqlite',(err)=>{
    if (err){
        console.error('Gagal konek ke SqLite',err.message);

    }else{
        console.log('Terhubung ke SqLite/');
    }
})
const mongoose = require('mongoose');

const mongoURI = ''//isi database;

mongoose.connect(mongoURI)
    .then(()=>console.log('Terhubung ke mongodb.'))
    .catch(err => console.error('Gagal konek ke mongoDB',err))
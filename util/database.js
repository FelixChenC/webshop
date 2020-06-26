const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
    MongoClient.connect('mongodb+srv://Felix_user1:scar0929@cluster0-meav9.mongodb.net/shop?retryWrites=true&w=majority')
.then(client => {
    console.log('Connected');
    _db = client.db()
    callback();
})
.catch(err => {
    console.log(err)
    throw err
});
};

const getDb = () => {
    if(_db){
        return _db;
    }
    throw 'No database found!';
}

exports.mongoConnect = mongoConnect
exports.getDb = getDb;








// const {Sequelize} = require('sequelize');

// const sequelize = new Sequelize('node-complete','root','scar0929',{
//     dialect: 'mysql', 
//     host:'localhost'
// });

// module.exports = sequelize;

// const mysql = require('mysql2');

// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     database: 'node-complete',
//     password: 'scar0929'
// });

// module.exports = pool.promise();
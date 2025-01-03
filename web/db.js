// const mongoose = require('mongoose');
// const { mongo } = require('./environment');
// const colors = require('colors');

// function getConnection() {
  
//   mongoose.connect(process['env']['DB_URL'], {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
//   });

//   mongoose.connection.on('error', (err) => console.log(`Mongoose default connection error: ${err}`.bgRed));
//   mongoose.connection.on('disconnected', () => console.log('Mongoose default connection disconnected'.bgYellow));
//   mongoose.connection.on('connected', () => console.log(`Mongoose is connected`.bgGreen));

//   process.on('SIGINT', () => mongoose.connection.close(() => process.exit(0)));
// }

// module.exports = getConnection

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const dbConfig = {
    host: 'eu-cdbr-west-02.cleardb.net',
    user: 'b5af0859c0faaa',
    password: '0127196f',
    database: 'heroku_f930aca5c566b3d'
}

var connection = ''
/*Code taken from https://stackoverflow.com/questions/20210522/nodejs-mysql-error-connection-lost-the-server-closed-the-connection*/
function handleDisconnect() {
    connection = mysql.createConnection(dbConfig)
    
    connection.connect(function (err) {              // The server is either down
        if (err) {                                     // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err)
            setTimeout(handleDisconnect, 2000) // We introduce a delay before attempting to reconnect,
        }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
    // If you're also serving http, display a 503 error.
    connection.on('error', function (err) {
        console.log('reconnecting to database')
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect()                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err                               // server variable configures this)
        }
    })
}




// Initialize the app
const app = express();

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next()
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', function (req, res) {
    res.send('Middleware for MySQL database and Frontend')
})

app.get('/active_orders', function (req, res) {
    handleDisconnect()
    console.log('getting orders')
    connection.query('SELECT * FROM active_orders', function (error, results, fields) {
        if (error) throw error;
        res.send(results)
    })
})


app.get('/products', function (req, res) {
    handleDisconnect()
    console.log('getting orders')
    connection.query('SELECT * FROM products', function (error, results, fields) {
        if (error) throw error;
        res.send(results)
    })
})

app.post('/active_orders', function (req, res) {
    handleDisconnect()
    const active_order = { order: JSON.stringify(req.body) }
    console.log('sending order...')
    connection.query('INSERT INTO active_orders set ?', active_order, function (error, results, fields) {
        if (error) throw error
        res.status(201).end()
        console.log('order sent')

    })
})


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
})

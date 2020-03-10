const express = require('express')
const mysql = require('mysql')

const dbConfig = {
    host: 'eu-cdbr-west-02.cleardb.net',
    user: 'b5af0859c0faaa',
    password: '0127196f',
    database: 'heroku_f930aca5c566b3d'
}

var connection
/*Code taken from https://stackoverflow.com/questions/20210522/nodejs-mysql-error-connection-lost-the-server-closed-the-connection */
function handleDisconnect() {
    connection = mysql.createConnection(dbConfig)
    console.log('Connected to database')
    
    connection.connect(function (err) {              // The server is either down
        if (err) {                                     // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err)
            setTimeout(handleDisconnect, 2000) // We introduce a delay before attempting to reconnect,
        }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
    // If you're also serving http, display a 503 error.
    connection.on('error', function (err) {
        console.log('Connection was lost to database, reconnecting...')
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect()                         // lost due to either server restart, or a
        } else if (err.code === 'ER_USER_LIMIT_REACHED') {
            handleDisconnect()
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

app.get('/staff', function (req, res) {
    handleDisconnect()
    console.log('getting orders')
    connection.query('SELECT * FROM staff', function (error, results, fields) {
        if (error) throw error;
        res.send(results)
    })
})

app.get('/kitchen_orders', function (req, res) {
    handleDisconnect()
    console.log('getting orders')
    connection.query('SELECT * FROM kitchen_orders', function (error, results, fields) {
        if (error) throw error;
        res.send(results)
    })
})

app.get('/finished_orders', function (req, res) {
    handleDisconnect()
    console.log('getting orders')
    connection.query('SELECT * FROM finished_orders', function (error, results, fields) {
        if (error) throw error;
        res.send(results)
    })
})

app.post('/finished_orders', function (req, res) {
    handleDisconnect()
    var orderId = req.body.id
    var order = JSON.stringify(req.body.orders)
    console.log('sending order id:', orderId, ' and order:', order,'to the be delivered')
    connection.query('INSERT INTO finished_orders SET id= ?, order =?', [orderId, order], function (error, results, fields) {
        if (error) throw error
        res.status(201).end()
        console.log('sent order to kitchen')
    })
})

app.post('/kitchen_orders', function (req, res) {
    handleDisconnect()
    var orderId = req.body.id
    var order = JSON.stringify(req.body.order)
    console.log('sending order id:',orderId,'to the kitchen')
    connection.query('INSERT INTO kitchen_orders SET id= ?, orders =?', [orderId, order], function (error, results, fields) {
        if (error) throw error
        res.status(201).end()
        console.log('sent order to kitchen')
    })
})

app.post('/delete_active_orders', function (req, res) {
    handleDisconnect()
    console.log('cancelling order id: ', req.body)
    var orderId = req.body
    connection.query('DELETE FROM active_orders WHERE id= ? ', orderId, function (error, results, fields) {
        if (error) throw error
        res.status(201).end()

        console.log('deleted order id:', orderId)
    })
})

app.post('/delete_kitchen_orders', function (req, res) {
    handleDisconnect()
    console.log('cancelling order id: ', req.body)
    var orderId = req.body
    connection.query('DELETE FROM kitchen_orders WHERE id= ? ', orderId, function (error, results, fields) {
        if (error) throw error
        res.status(201).end()

        console.log('deleted order id:', orderId)
    })
})

app.post('/delete_finished_orders', function (req, res) {
    handleDisconnect()
    console.log('cancelling order id: ', req.body)
    var orderId = req.body
    connection.query('DELETE FROM finished_orders WHERE id= ? ', orderId, function (error, results, fields) {
        if (error) throw error
        res.status(201).end()

        console.log('deleted order id:', orderId)
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








const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`)
})


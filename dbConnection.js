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
    
    console.log('Connected to database')
    connection = mysql.createConnection(dbConfig)
    connection.connect(function (err) {              // The server is either down
        if (err) {                                     // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err)
            setTimeout(handleDisconnect(), 2000) // We introduce a delay before attempting to reconnect,
        }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
    // If you're also serving http, display a 503 error.
    connection.on('error', function (err) {
        console.log('Connection was lost to database, reconnecting...')
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect()                         // lost due to either server restart, or a
        } else if (err.code === ' ER_USER_LIMIT_REACHED') {
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
        if (error) {
            throw error
            handleDisconnect()
        }
        res.send(results)
    })
})

app.get('/payment_orders', function (req, res) {
    handleDisconnect()
    console.log('getting customers orders pending payment')
    connection.query('SELECT * FROM payment_orders', function (error, results, fields) {
        if (error) {
            throw error
            handleDisconnect()
        }
        res.send(results)
    })
})

app.get('/products', function (req, res) {
    handleDisconnect()
    console.log('getting orders')
    connection.query('SELECT * FROM products', function (error, results, fields) {
        if (error) {
            throw error
            handleDisconnect()
        }
        res.send(results)
    })
})

app.get('/staff', function (req, res) {
    handleDisconnect()
    console.log('getting orders')
    connection.query('SELECT * FROM staff', function (error, results, fields) {
        if (error) {
            throw error
            handleDisconnect()
        }
        res.send(results)
    })
})

app.get('/managerlogin', function (req, res) {
    handleDisconnect()
    console.log('getting managers')
    connection.query('SELECT * FROM managerlogin', function (error, results, fields) {
        if (error) {
            throw error
            handleDisconnect()
        }
        res.send(results)
    })
})

app.get('/kitchen_orders', function (req, res) {
    handleDisconnect()
    console.log('getting orders')
    connection.query('SELECT * FROM kitchen_orders', function (error, results, fields) {
        if (error) {
            throw error
            handleDisconnect()
        }
        res.send(results)
    })
})

app.get('/finished_orders', function (req, res) {
    handleDisconnect()
    console.log('getting orders')
    connection.query('SELECT * FROM finished_orders', function (error, results, fields) {
        if (error) {
            throw error
            handleDisconnect()
        }
        res.send(results)
    })
})

app.post('/kitchen_finished_orders', function (req, res) {
    handleDisconnect()
	var post = { id: req.body.id, order: JSON.stringify(req.body.orders), customerSessionID: req.body.customerSessionID, kitchenStaffUsername: req.body.staffUsername }
	
    console.log('order: ', post.order)
	console.log('customer session ID: ', post.customerSessionID)
	console.log('kitchen staff Username: ', post.kitchenStaffUsername)
	
    connection.query('INSERT INTO finished_orders SET ? ', post, function (error, results, fields) {

        if (error) {
            throw error
            handleDisconnect()
        }
        res.status(201).end()

        console.log('completed order to be finished')
    })
})

app.post('/update_products', function (req, res) {
    handleDisconnect()
    console.log('Updating products...')
    connection.query('UPDATE products SET name=?, type=?, price=?, description=?, available=?, calories=?, glutenfree=?, vegan=?, vegetarian=? WHERE id=?', [req.body.name, req.body.type, req.body.price, req.body.description, req.body.available, req.body.calories, req.body.glutenfree, req.body.vegan, req.body.vegetarian, req.body.id], function (error, results, fields) {
        if (error) {
            throw error
            handleDisconnect()
        }
        res.status(201).end()
        console.log('updated successfully')
    })
})

app.post('/waiter_finished_orders', function (req, res) {
    handleDisconnect()
	var post = { id: req.body.id, waiterStaffUsername: req.body.staffUsername }
	
    console.log('order id: ', post.id)
	console.log('waiter staff Username: ', post.waiterStaffUsername)
	
    connection.query('UPDATE finished_orders SET waiterStaffUsername=? WHERE id=?', [req.body.staffUsername, req.body.id], function (error, results, fields) {

        if (error) {
            throw error
            handleDisconnect()
        }
        res.status(201).end()

        console.log('completed order to be finished')
    })
	
})

app.post('/kitchen_orders', function (req, res) {
    handleDisconnect()
	var post = { id: req.body.id, orders: JSON.stringify(req.body.order), customerSessionID: req.body.customerSessionID}
    console.log('sending order id:', post.id, 'to the kitchen')
    console.log('order: ', post.orders)
	console.log('customer session ID: ', post.customerSessionID)
    connection.query('INSERT INTO kitchen_orders SET ? ', post, function (error, results, fields) {
        if (error) {
            throw error
            handleDisconnect()
        }
        res.status(201).end()
        console.log('sent order to kitchen')
    })
})

app.post('/manager_orders', function (req, res) {
    handleDisconnect()
	var post = { id: req.body.id, order: JSON.stringify(req.body.order), customerSessionID: req.body.customerSessionID, waiterStaffUsername: req.body.waiterStaffUsername, kitchenStaffUsername: req.body.kitchenStaffUsername}
    console.log('sending order id:', post.id, 'to the manager')
    console.log('order: ', post.orders)
	console.log('customer session ID: ', post.customerSessionID)
	console.log('kitchen ID: ', post.kitchenStaffUsername)
	console.log('waiter ID: ', post.waiterStaffUsername)
    connection.query('INSERT INTO manager_orders SET ? ', post, function (error, results, fields) {
        if (error) {
            throw error
            handleDisconnect()
        }
        res.status(201).end()
        console.log('sent order to kitchen')
    })
})

app.post('/payment_orders', function (req, res) {
    handleDisconnect()
	var post = { id: req.body.id, order: JSON.stringify(req.body.order), customerSessionID: req.body.customerSessionID }
    console.log('sending order id:', post.id, 'to the customer for payment')
    console.log('order to pay for: ', post.orders)
	console.log('customer session ID: ', post.customerSessionID)
    connection.query('INSERT INTO payment_orders SET ? ', post, function (error, results, fields) {
        if (error) {
            throw error
            handleDisconnect()
        }
        res.status(201).end()
        console.log('sent order to kitchen')
    })
})

app.post('/delete_finished_orders', function (req, res) {
    handleDisconnect()
    console.log('cancelling order id: ', req.body)
    var orderId = req.body
    connection.query('DELETE FROM finished_orders WHERE id= ? ', orderId, function (error, results, fields) {
        if (error) {
            throw error
            handleDisconnect()
        }
        res.status(201).end()

        console.log('deleted order id:', orderId)
    })
})

app.post('/delete_active_orders', function (req, res) {
    handleDisconnect()
    console.log('cancelling order id: ', req.body)
    var orderId = req.body
    connection.query('DELETE FROM active_orders WHERE id= ? ', orderId, function (error, results, fields) {
        if (error) {
            throw error
            handleDisconnect()
        }
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


app.post('/active_orders', function (req, res) {
    handleDisconnect()
    var post = { customerSessionID: req.body.customerSessionID, order: JSON.stringify(req.body.order)}
    console.log('Sending: ', post)
    console.log('sending customer id:', post.customerSessionID, 'to the active orders') 
    connection.query('INSERT INTO active_orders SET ? ', post, function (error, results, fields) {
        if (error) {
            throw error
            handleDisconnect()
        }
        res.status(201).end()
        console.log('sent order to active')
    })   
})

app.post('/pay_orders', function (req, res) {
    handleDisconnect()
    var customerSessionID = req.body
    console.log('Marking customer ', customerSessionID, ' orders as paid!')
    connection.query('UPDATE payment_orders SET paymentStatus=1 WHERE customerSessionID=?', customerSessionID, function (error, results, fields) {
        if (error) {
            throw error
            handleDisconnect()
        }
        res.status(201).end()
        console.log('MARKED CUSTOMER: ', customerSessionID, ' ORDERS AS PAID SUCCESSFULLY')
    })
})

app.post('/make_available', function (req, res) {
    handleDisconnect()
    var productId = req.body.id
    console.log('Making id: ', productId, ' available')
    connection.query('UPDATE products SET available=1 WHERE id=? ', productId, function (error, results, fields) {
        if (error) {
            throw error
            handleDisconnect()
        }
        res.status(201).end()
        console.log('made id: ',productId,' available')
    })
})

app.post('/make_unavailable', function (req, res) {
    handleDisconnect()
    var productId = req.body.id
    console.log('Making id: ', productId, ' unavailable')
    connection.query('UPDATE products SET available=0 WHERE id=?', productId, function (error, results, fields) {
        if (error) {
            throw error
            handleDisconnect()
        }
        res.status(201).end()
        console.log('made id: ', productId, ' unavailable')
    })
})






const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`)
})


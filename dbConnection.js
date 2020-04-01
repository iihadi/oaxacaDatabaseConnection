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
	var kitchenUsername = req.body.staffUsername;
	var kitchenStaffID;
	
	connection.query('SELECT staffID FROM staff WHERE username = ?', kitchenUsername, function (error, results, fields) {

        if (error) {
            throw error
            handleDisconnect()
        }
		
		setKitchenID(results);
		
        res.status(201).end()
		
        console.log('determined staff ID from staff username')
    })
	
	function setKitchenID(id) {
		kitchenStaffID = id;
		console.log('KITCHEN STAFF ID CONFIRMATION: ', kitchenStaffID)
	}
	
	var post = { id: req.body.id, order: JSON.stringify(req.body.orders), customerSessionID: req.body.customerSessionID, kitchenStaffID: kitchenStaffID }
	
    console.log('order: ', post.order)
	console.log('customer session ID: ', post.customerSessionID)
	console.log('kitchen staff ID: ', post.kitchenStaffID)
	
    connection.query('INSERT INTO finished_orders SET ? ', post, function (error, results, fields) {

        if (error) {
            throw error
            handleDisconnect()
        }
        res.status(201).end()

        console.log('completed order to be finished')
    })
})

app.post('/waiter_finished_orders', function (req, res) {
    handleDisconnect()
	var waiterUsername = req.body.staffUsername;
	var waiterStaffID;
	connection.query('SELECT staffID FROM staff WHERE username = ?', waiterUsername, function (error, results, fields) {

        if (error) {
            throw error
            handleDisconnect()
        } else {
			setWaiterID(results);
		}
		
        res.status(201).end()
		
        console.log('determined staff ID from staff username')
    })
	
	function setWaiterID(id) {
		waiterStaffID = id;
		console.log('WAITER STAFF ID CONFIRMATION: ', waiterStaffID)
	}
	
	var post = { id: req.body.id, waiterStaffID: waiterStaffID }
	
    console.log('order id: ', post.id)
	console.log('waiter staff ID: ', post.waiterStaffID)
	
    connection.query('UPDATE finished_orders SET waiterStaffID = '+post.waiterStaffID+' WHERE id = '+post.id+'', function (error, results, fields) {

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


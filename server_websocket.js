/*  Websocket GUI for node and python, Web browser integration.
    Code managed by sendust. 2024/4/1
    Important event type : engine, gui, server
    Retrieve client list from node server..
*/


const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {maxHttpBufferSize: 1e8});

const port = 50080;

app.get('/gui', function(req, res){
        res.sendFile(__dirname + '/index.html');
});


app.get('/', function(req, res){
        res.send("<html>It works</html>");
});

// const users = new Map();
// const hosts = new Map();
const users = {};
const hosts = {};

io.on('connection', function(socket){
    console.log('A user connected  ' + socket.id);
	// socket.emit('your_id', socket.id);  // Request client information
	socket.emit('server', {"msg" : "your_id" , "id" : socket.id});  // Request client information

    socket.on('server', function(data){  // Colelct client imformation with server event
		updatelog('server event data = ' + JSON.stringify(data))
        event_handler_server(data);
	});

	socket.onAny((data)=>{
		updatelog(`Event name -> [${data}]  ${hosts[socket.id]}  ${socket.id}`)
	});


   socket.on('disconnect', function () {
        updatelog('A user disconnected ' + socket.id);
		delete users[socket.id];
        delete hosts[socket.id];
   });

	socket.on('engine', (data)=>{
        // socket.broadcast.emit("engine", data);
        // console.log(data);
		if (data["touser"])		// there is specified gui listener
		{
			io.to(data["touser"]).emit("engine", data);
		}
		else
		{
			emit_to("engine", "gui", data);
		}


    });
	
   socket.on('gui', (data)=>{
        // socket.broadcast.emit("gui", data);
        // console.log(data);
		if (data["touser"])		// there is specified engine listener
		{
			io.to(data["touser"]).emit("gui", data);
		}
		else			// broadcast to all engine
		{
			emit_to("gui", "engine", data);
		}
    });

});


function event_handler_server(data)
{
    if (data["msg"] == "reportID")
    {
        users[data["id"]] =  data["type"];
        hosts[data["id"]] =  data["host"];
        console.log(users);
        console.log(hosts);
    }
    else if (data["msg"] == "get_clients")
    {
        for (var each of get_client())
        {
            each["msg"] = "clients";
            io.to(data["id"]).emit("server", each);
            //console.log(JSON.stringify(each));
        };
    }
}


function get_client()
{
    var clients = [];

    for (var [key, value] of Object.entries(users))
    {
        var client_data = {};
        client_data["id"] = key;
        client_data["user"] = value;
        client_data["host"] = hosts[key];
        //console.log(JSON.stringify(client_data));
        clients.push(client_data);
    };

    return clients;
}

function emit_to(event, to, data)
{
	var clients = io.sockets;
	clients.sockets.forEach(function(socket){
		//console.log(users.get(socket.id));
		if (users[socket.id] == to)
		{
			//console.log("emit data to  " + socket.id);
			io.to(socket.id).emit(event, data);
		}
	});		
};


function updatelog(text){
    now = new Date().toISOString();
    console.log(now + " " + text);
}

http.listen(port, function(){
   // console.log('listening on localhost:3000');
   updatelog(`listening on localhost:${port}`);
});




setInterval(function(){
    console.log("---------------------");
    console.log(get_client());
    console.log("======================");
    }, 3000);

setTimeout(()=>{console.log(`open with web browser http://127.0.0.1:${port}`)}, 2000);

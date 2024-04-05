#   WWW GUI interface for python 
#   socketio
#   python example.
#   Code managed by sendust
#   2024/4/4    Improve socket connection retry


import socketio, time
from sendustlogger import updatelog
from socket import gethostname


class sioclient():
    def __init__(self):
        print('Create python socket.io object')
        self.sio = socketio.Client(reconnection = False, reconnection_delay=0.1, request_timeout = 0.1, reconnection_attempts=1)
        self.sio.on("connect", self.on_connect)
        self.sio.on("disconnect", self.on_disconnect)
        self.sio.on("server", self.on_msg_server)
        self.sio.on("gui", self.on_msg_gui)
        self.sio.on("engine", self.on_msg_engine)
        self.recv_fn = print
        self.id = ''
        self.event = "message"      # select [engine] or [gui]
        self.count_reconnect = 0
    
    def on_connect(self):
        print('connection established', self.sio.sid)

    def set_recv_fn(self, fn):
        self.recv_fn = fn
    
    def on_msg_server(self, data):
        print('server message received =>', data)
        if (data.get("msg") == "your_id"):
            print("Answer id request from server..")
            self.id = data.get("id")
            self.sio.emit("server", {"id" : self.id, "type" : self.event, "host" : gethostname(), "msg" : "reportID"})

    def on_msg_gui(self, data):
        print('gui received =>', data)
        self.recv_fn(data)

    def on_msg_engine(self, data):
        print('engine received =>', data)
        self.recv_fn(data)


    def on_disconnect(self):
        print('disconnected from server')
        
    def connect(self, address):
        self.address = address

        try:
            self.sio.connect(address)
        except Exception as e:
            print(f'Error connecting socket io.. {self.count_reconnect}')
            self.count_reconnect += 1
        finally:
            return self.sio.connected

    def disconnect(self):
        try:
            self.sio.disconnect()
        except Exception as e:
            print(e)
          

    def send(self, name_event, data):
        if self.sio.connected:
            self.count_reconnect = 0
            self.sio.emit(name_event, data)
            print('send data    ' + str(data))
        else:
            print("socket not connected.. retry next send...")
            self.disconnect()
            self.connect(self.address)
        
      

class webgui:
    
    def __init__(self, address = "http://127.0.0.1:5000"):
        self.address = address
        self.socket = sioclient()
        updatelog(f'[WEB] ws address is {address}')
    
    def start(self, recv_fn):
        updatelog("Start socketio...")
        self.socket.set_recv_fn(recv_fn)
        if (not self.socket.connect(self.address)):
            updatelog("Cannot establish socketio... check server..")
            return
    
    def set_event(self, evnt):
        self.socket.event = evnt

    def send(self, msg, touser = ''):
        self.sendEvent(self.socket.event, msg, touser)

    def sendEvent(self, eventname, msg, touser):
        try:
            self.socket.send(eventname, {"id" : self.socket.id, "msg" : msg, "touser" : touser})
        except Exception as e:
            print(e)


def decode_protocol(protocol):
    print(protocol)


if (__name__ == "__main__"):
    wg = webgui("http://127.0.0.1:50080")
    wg.set_event("engine")      # set engine or gui
    wg.start(decode_protocol)



    while True:
        wg.send(f'test message =-- {time.time()}')
        time.sleep(1)
# sendust GUI (node + python + html)

python and web GUI integration with socket.io

## Installation

Install node packages, python modules

```bash
pip install python-socketio
pip install socketio-client

npm install socket.io
```

## Usage

```python
wg = webgui("http://127.0.0.1:50080")
wg.set_event("engine")      # set engine or gui
wg.start(decode_protocol)    # callback function
```


## Example run
- windows batch

1_start_server_socket.bat

2_start_python_engine.bat

- open web browser

http://127.0.0.1:50080/gui
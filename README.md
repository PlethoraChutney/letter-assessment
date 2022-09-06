# Installation

1. `python3 -m virtualenv venv`
2. `source venv/bin/activate`
3. `python3 -m pip install -r requirements.txt`

# Usage
On a mac, just double-click the `launch_server.command` script.
By default, the server runs on `localhost:5000`. It's not a production
server, but it just needs to run locally, so why bother.

The server will make its own database if there isn't one already.
You can add or remove students with the respective links. The dashboard
shows the results of each student's latest quiz.
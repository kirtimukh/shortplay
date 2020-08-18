from flask import Flask
from flask_socketio import SocketIO
from flask_talisman import Talisman


csp = {
    'default-src': '\'self\'',
    'style-src': [
            '\'self\'',
            '\'unsafe-inline\' https://maxcdn.bootstrapcdn.com',
            '\'unsafe-inline\' https://cdnjs.cloudflare.com',
            '\'unsafe-inline\' https://ajax.googleapis.com'
        ],
    'script-src': [
            '\'self\'',
            '\'unsafe-inline\' https://maxcdn.bootstrapcdn.com',
            '\'unsafe-inline\' https://cdnjs.cloudflare.com',
            '\'unsafe-inline\' https://ajax.googleapis.com'
        ],
    'server': ''
}

app = Flask(__name__, static_url_path='', 
            static_folder='static')
talisman = Talisman(app, content_security_policy=csp,
                    content_security_policy_nonce_in=['default-src'])
socketio = SocketIO(app, engineio_logger=True)


from app import routes


if __name__ == '__main__':
    socketio.run(app)

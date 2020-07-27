import random, string
from app import app, socketio
from flask import render_template, flash, redirect, url_for, request
from flask_socketio import disconnect, emit, send


BASE_URL = "127.0.0.1:5000"


sessions = {}
sessions_re = {}
ongoing_game = {}


@app.route('/')
def index():
    return render_template('tictactoe.html', title='Tic Tac Toe', base_url=BASE_URL)


def make_user():
    user_exists = True
    while(user_exists):
        user = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(8))
        if user not in sessions:
            user_exists = False
    return user


@socketio.on('connect')
def display():
    user = make_user()
    room = request.sid
    sessions[user] = room
    sessions_re[room] = user
    emit('connect_success', {'user': user}, room = room)


@socketio.on('send_request')
def play_requested(data):
    sid = request.sid
    request_by = sessions_re[sid]
    request_to = data['request_to'].upper()
    room = sessions[request_to]
    ongoing_game[request_to] = request_by
    emit('receive_request', {'request_by': request_by}, room=room)


@socketio.on('accept_request')
def accept_request(data):
    sid = request.sid
    accepted_by = sessions_re[sid]
    request_by = ongoing_game[accepted_by]
    room = sessions[request_by]
    ongoing_game[request_by] = accepted_by
    if data['accepted']:
        emit('request_accepted', {'accepted': True}, room=room)
        emit('first_turn', {'myTurn': True}, room=sessions[accepted_by], namespace='/gameplay')


@socketio.on('reject_request')
def reject_request(data):
    if data['reject_request']:
        sid = request.sid
        reject_by = sessions_re[sid]
        reject_to = ongoing_game[reject_by]
        ongoing_game.pop(reject_by)
        room = sessions[reject_to]
        emit('request_rejected', 'Your play request has been rejected', room=room)


@socketio.on('disconnect')
def disconnect_protocol():
    sid = request.sid
    disconnect_by = sessions_re[sid]
    if disconnect_by in ongoing_game:
        was_playing_with = ongoing_game[disconnect_by]
        ongoing_game.pop(was_playing_with)
        ongoing_game.pop(disconnect_by)
        room = sessions[was_playing_with]
        emit('disconnect_by_player', {'event': 'disconnect_by_player'}, room=room)
    sessions.pop(disconnect_by)
    sessions_re.pop(sid)


@socketio.on('playon', namespace='/gameplay')
def nots_n_axes(data):
    pass


@socketio.on('play_data1', namespace='/gameplay')
def play(data):
    sid = request.sid
    played_by = sessions_re[sid]
    turn_player = ongoing_game[played_by]
    room = sessions[turn_player]
    emit('play_data2', {'cell_id': data['cell_id']}, room=room, namespace='/gameplay')


@socketio.on('restart_game', namespace='/gameplay')
def restart(msg):
    sid = request.sid
    player1 = sessions_re[sid]
    player2 = ongoing_game[player1]
    room = sessions[player2]
    emit('restart_game', 'restart_game', room=room, namespace='/gameplay')
// 'use strict';

var usernamePage = document.getElementById("username-page")
var chatPage = document.getElementById("chat-page")
var usernameForm = document.getElementById('usernameForm');
var messageForm = document.getElementById('messageForm');
var messageInput = document.getElementById('message');
var messageArea = document.getElementById('messageArea');
var connectingElement = document.querySelector('.connecting');

var stompClient = null;
var username = null;


const colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];



function connect(event) {
    username = document.getElementById("name").value.trim()
    if (username) {
        usernamePage.classList.add('hidden')
        chatPage.classList.remove('hidden')

        var socket = new SocketJS('/ws')
        stompClient = Stomp.over(socket)
        stompClient.connect({}, onConnect, onError)
    }
    event.preventDefault();
}

function oneConnect(event) {
    stompClient.subcribe('/topic/public', onMessageReceived)
    stompClient.send('/app/chat.addUser', {},
        Json.stringify({sender: username, type: 'JOIN'}))
    connectingElement.classList.add('hidden')
}

function onError() {
    connectingElement.textContent = 'Could not connect to server'

}


usernameForm.addEventListener('submit', connect, true)



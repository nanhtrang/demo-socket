// 'use strict';

var usernamePage = document.getElementById("username-page")
var chatPage = document.getElementById("chat-page")
var usernameForm = document.getElementById('usernameForm');
var messageForm = document.getElementById('messageForm');
var messageInput = document.getElementById('message');
var messageArea = document.getElementById('message-area');
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

        var socket = new SockJS('/ws')
        stompClient = Stomp.over(socket)
        stompClient.connect({}, onConnected, onError)
    }
    event.preventDefault();
}

function onConnected(event) {
    stompClient.subscribe('/topic/public', onMessageReceived)
    stompClient.send('/app/chat.addUser', {},
        JSON.stringify({sender: username, type: 'JOIN'}))
    connectingElement.classList.add('hidden')
}

function onMessageReceived(payload) {
    const chatMessage = JSON.parse(payload.body)

    const messageElement = document.createElement('li')

    if (chatMessage.type === 'JOIN') {
        messageElement.classList.add('event-message')
        messageElement.content = chatMessage.sender + ' joined!'
        chatMessage.content = messageElement.content
    } else if (chatMessage.type === 'LEAVE') {
        messageElement.classList.add('event-message')
        messageElement.content = chatMessage.sender + ' left!'
        chatMessage.content = messageElement.content
    } else {
        messageElement.classList.add('chat-message')
        const avatarElement = document.createElement('i')
        const avatarText = document.createTextNode(chatMessage.sender[0])
        avatarElement.appendChild(avatarText)
        avatarElement.style['backgroundColor'] = getAvatarColor(chatMessage.sender)

        messageElement.appendChild(avatarElement);
        const usernameElement = document.createElement('span')
        const usernameText = document.createTextNode(chatMessage.sender)
        usernameElement.appendChild(usernameText)
        messageElement.appendChild(usernameElement)

    }



    const textElement = document.createElement('p')
    const messageText = document.createTextNode(chatMessage.content)

    textElement.appendChild(messageText)
    messageElement.appendChild(textElement)

    messageArea.appendChild(messageElement)
    messageArea.scrollTop = messageArea.scrollHeight
    // event.preventDefault()
}

function getAvatarColor(messageSender) {
    let hash = 0
    for(let i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i)
    }
    const index = Math.abs(hash % colors.length)
    return colors[index]
}

function onError() {
    connectingElement.textContent = 'Could not connect to server'
    connectingElement.style.color = 'red'
}

function sendMessage(event) {
    const  messageContent = messageInput.value.trim()
    debugger
    if (messageContent && stompClient) {
        const chatMessage = {
            sender: username,
            type: 'CHAT',
            content: messageContent
        }
        stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(chatMessage))
        messageInput.value = ''
    }
    event.preventDefault()
}


usernameForm.addEventListener('submit', connect, true)
messageForm.addEventListener('submit', sendMessage, true)



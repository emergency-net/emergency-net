const form = document.querySelector('#form')

const token = localStorage.getItem('token')

const headers = {}
headers['Content-Type'] = 'application/json'
if (token) {
    headers.Authorization = 'Bearer ' + token
} else {
    document.body.innerHTML = ''

    const para1 = document.createElement('p')
    para1.textContent = 'You need to register in order to send and read messages.'

    const para2 = document.createElement('p')
    para2.textContent = 'You are being redirected to the registration page.'

    document.body.appendChild(para1)
    document.body.appendChild(para2)

    setTimeout(() => {
        window.location.href = '/register'
    }, 5000);
}

let db

const request = indexedDB.open('messageDB')

request.onerror = function (event) {
    console.error(event.target.errorCode)
}



request.onupgradeneeded = function (event) {
    db = event.target.result

    db.createObjectStore('messages_os', { keyPath: 'name' })
}

let messages = new Set()

request.onsuccess = function (event) {
    db = event.target.result

    const transaction = db.transaction(['messages_os'], 'readonly')
    const messageStore = transaction.objectStore('messages_os')

    const getRequest = messageStore.get('messages')
    getRequest.onsuccess = function () {
        if (getRequest.result) {
            messages = getRequest.result.data
            console.log(getRequest.result.data)
        }
        const data = {
            foo: 'bar',
            messages: Array.from(messages)
        }
        fetch('/messages', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                console.log(data)
                if (data instanceof Array) {
                    renderMessages(data)
                }
            })
            .catch(error => {
                console.log(error.message)
            })
    }

    form.addEventListener('submit', event => {
        const message = document.querySelector('#message').value
        const data = { message: message, messages: Array.from(messages) }
        
        fetch('/send-message', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                if (data instanceof Array) {
                    for (const message of data) {
                        messages.add(message)
                    }
                    const transaction = db.transaction(['messages_os'], 'readwrite')
                    const messageStore = transaction.objectStore('messages_os')
                    const putRequest = messageStore.put({
                        name: 'messages',
                        data: messages
                    })
                    putRequest.onsuccess = function () {
                        console.log('saved the messages to the IDB');
                    }
                    renderMessages(messages)
                }
            })
            .catch(error => {
                renderError(error)
            })
    
        event.preventDefault()
    })
}




function renderMessages(messages) {
    const messageList = document.querySelector('#messages')
    messageList.innerHTML = ''
    for (const message of messages) {
        const newMessage = document.createElement('li')
        newMessage.textContent = message
        messageList.appendChild(newMessage)
    }
}

function renderError(error) {
    const errorMessage = document.querySelector('#error')
    errorMessage.textContent = error.message
}
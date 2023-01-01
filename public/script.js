const token = localStorage.getItem('token')
const headers = {
    'Content-Type': 'application/json'
}
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

let messages = new Map([
    ['1', new Map()],
    ['2', new Map()],
    ['3', new Map()]
])

request.onsuccess = function (event) {
    db = event.target.result

    for (let i = 1; i <= 3; i++) {
        const form = document.querySelector(`#form-ch${i}`)
        form.addEventListener('submit', event => {
            const message = document.querySelector(`#message-ch${i}`).value
            const data = { message: message }

            fetch(`/new-message/${i}`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then(data => {
                    for (const message of data) {
                        messages.get(i.toString()).set(message[0], message[1])
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
                    renderMessages(messages, i.toString())
                })
                .catch(error => {
                    renderError(error)
                })

            event.preventDefault()
        })

        document.querySelector(`#sync-ch${i}`).addEventListener('click', event => {
            event.preventDefault()

            fetch(`/sync/${i}`, {
                method: 'GET',
                headers: headers
            })
                .then(response => response.json())
                .then(keys => {
                    let keysNeeded = []
                    const existingKeys = []

                    let transaction = db.transaction(['messages_os'], 'readwrite')
                    let messageStore = transaction.objectStore('messages_os')
                    const getRequest = messageStore.get('messages')
                    getRequest.onsuccess = function (event) {
                        console.log(event.target.result)
                        const newMessages = new Map()
                        if (event.target.result) {
                            messages = event.target.result.data
                            for (const key of keys) {
                                debugger
                                if (!messages.get(i.toString()).has(key)) {
                                    debugger
                                    keysNeeded.push(key)
                                } else {
                                    existingKeys.push(key)
                                }
                            }

                            for (const key of messages.get(i.toString()).keys()) {
                                if (!existingKeys.includes(key)) {
                                    newMessages.set(key, messages.get(i.toString()).get(key))
                                }
                            }
                        } else {
                            keysNeeded = keys  // if there are no messages stored in the browser, request all messages  
                        }

                        fetch(`/messages/${i}`, {
                            method: 'POST',
                            headers: headers,
                            body: JSON.stringify({
                                keysNeeded: keysNeeded,
                                newMessages: Array.from(newMessages)
                            })
                        })
                            .then(response => response.json())
                            .then(messagesNeeded => {
                                for (const message of messagesNeeded) {
                                    messages.get(i.toString()).set(message[0], message[1])
                                }
                                transaction = db.transaction(['messages_os'], 'readwrite')
                                messageStore = transaction.objectStore('messages_os')
                                const putRequest = messageStore.put({
                                    name: 'messages',
                                    data: messages
                                })
                                putRequest.onsuccess = function () {
                                    console.log('saved the messages to the IDB');
                                }
                                renderMessages(messages, i.toString())
                            })
                    }
                })
                .catch(error => renderError(error))
        })
    }
}

function renderMessages(messages, ch) {
    const messageList = document.querySelector(`#messages-ch${ch}`)
    messageList.innerHTML = ''
    for (const message of messages.get(ch)) {
        const newMessage = document.createElement('li')
        messageContents = message[0].split(';')
        newMessage.textContent = `${messageContents[1]}@${messageContents[2]} at ${new Date(messageContents[0]).toLocaleString()}: ${message[1]}`
        messageList.appendChild(newMessage)
    }
}

function renderError(error) {
    const errorMessage = document.querySelector('#error')
    errorMessage.textContent = error.message
}
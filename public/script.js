const form = document.querySelector('#form')

const token = localStorage.getItem('token')
const headers = {}
if (token) {
    headers.Authorization = 'Bearer ' + token
}

form.addEventListener('submit', event => {
    const message = document.querySelector('#message').value
    const data = { message: message }
    headers['Content-Type'] = 'application/json'
    fetch('/send-message', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data instanceof Array) {
            renderMessages(data)
        }
    })
    .catch(error => {
        renderError(error)
    })

    event.preventDefault()
})


fetch('/messages', {
    method: 'GET',
    headers: headers
})
    .then(response => response.json())
    .then(data => {
        if (data instanceof Array) {
            renderMessages(data)
        }
    })
    .catch(() => {
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
    })

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
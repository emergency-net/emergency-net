const form = document.querySelector('#form')

form.addEventListener('submit', event => {
    
    const message = document.querySelector('#message').value
    const data = { message: message }

    fetch('/send-message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        renderMessages(data)
    })
    .catch(error => {
        renderError(error)
    })

    event.preventDefault()
})

fetch('/messages')
    .then(response => response.json())
    .then(data => {
        renderMessages(data)
    })
    .catch(error => {
        renderError(error)
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
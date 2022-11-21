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
        const messageList = document.querySelector('#messages')
        messageList.innerHTML = ''
        for (const message of data) {
            const newMessage = document.createElement('li')
            newMessage.textContent = message
            messageList.appendChild(newMessage)
        }
        
    })
    .catch(error => {
        const errorMessage = document.querySelector('#error')
        errorMessage.textContent = error.message
    })

    event.preventDefault()
})

fetch('/messages')
    .then(response => response.json())
    .then(data => {
        const messageList = document.querySelector('#messages')
        messageList.innerHTML = ''
        for (const message of data) {
            const newMessage = document.createElement('li')
            newMessage.textContent = message
            messageList.appendChild(newMessage)
        }
    })
    .catch(error => {
        const errorMessage = document.querySelector('#error')
        errorMessage.textContent = error.message
    })
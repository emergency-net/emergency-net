const form = document.querySelector('#form')

form.addEventListener('submit', event => {
    const username = document.querySelector('#username').value
    const data = { username: username }

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            localStorage.setItem('token', data.token)
            document.body.innerHTML = ''
                const para = document.createElement('p')
                para.textContent = 'You are being redirected to the home page'
                document.body.appendChild(para)
            setTimeout(() => {
                window.location.href = '/'
            }, 5000);

        })
        .catch(error => {
            renderError(error)
        })

    event.preventDefault()
})

function renderError(error) {
    const errorMessage = document.querySelector('#error')
    errorMessage.textContent = error.message
}

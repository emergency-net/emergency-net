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

if (localStorage.getItem('token')) {
    document.body.innerHTML = ''
    const para1 = document.createElement('p')
    para1.textContent = 'You are already registered.'

    const para2 = document.createElement('p')
    para2.textContent += ' Redirected to the home page.'
    document.body.appendChild(para1)
    document.body.appendChild(para2)
    setTimeout(() => {
        window.location.href = '/'
    }, 5000);
}

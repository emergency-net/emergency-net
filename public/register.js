const form = document.querySelector('#form')

// generate key pair
// let publicKey
// let privateKey
// crypto.subtle.generateKey(
//     {
//         name: "RSA-OAEP",
//         modulusLength: 4096,
//         publicExponent: new Uint8Array([1, 0, 1]),
//         hash: "SHA-512"
//     },
//     true,
//     ["encrypt", "decrypt"]
// ).then(keyPair => {
//     privateKey = keyPair.privateKey

//     return crypto.subtle.exportKey(
//         'jwk',
//         keyPair.publicKey
//     )
// }).then(publicKeyResult => {
//     publicKey = publicKeyResult
// })


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
            para.textContent = 'Successfully registered. You are being redirected to the home page'

            document.body.appendChild(para)

            setTimeout(() => {
                window.location.href = '/'
            }, 4000)
        })
        // .then(decrypted => {
        //     const tokenAndDate = new TextDecoder().decode(decrypted).split(';')
            
        //     if (Date.parse(tokenAndDate[1]) + 30000 < Date.now()) {
        //         document.body.innerHTML = ''

        //         const para = document.createElement('p')
        //         para.textContent = 'Time Out. Try Again.'

        //         document.body.appendChild(para)

        //         setTimeout(() => {
        //             window.location.href = '/register'
        //         }, 4000);
        //     }

            
        // })
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
    }, 4000);
}

function base64ToArrayBuffer(base64) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}
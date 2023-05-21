import { Form as FormR, useNavigate, useActionData, redirect } from 'react-router-dom'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Card from 'react-bootstrap/Card'
import { useEffect } from 'react'
import { JSEncrypt } from "jsencrypt";
const time = new Date()
export function Register() {
    const navigate = useNavigate()
    const data = useActionData()

    useEffect(() => {
        if (data) {
            localStorage.setItem('token', data.token)
            navigate('/')
        }
    }, [data])

    return (
        <Card>
            <Card.Body className='align-items-center'>
                <Card.Title className='text-center'>Registration</Card.Title>
                <Card.Subtitle className='mb-5 text-muted text-center'>You need to register to send and read messages.</Card.Subtitle>
                <FormR method='post' action='/register'>
                    <Form.Group className='w-75 mx-auto'>
                        <Form.Label>Username</Form.Label>
                        <Form.Control required type="text" name='username' placeholder="Enter username" />
                        <Form.Text className="text-muted">
                            Your username needs to be unique in this access point.
                        </Form.Text>
                    </Form.Group>
                    <div className='d-flex justify-content-center'>
                        <Button variant="primary" type="submit">
                            Register
                        </Button>
                    </div>
                </FormR>
            </Card.Body>
        </Card >
    )
}

export async function action({ request }) {
    const form_data = Object.fromEntries(await request.formData())

    if (form_data.username === '')
        throw new Response('Bad Request', {status: 400, statusText: 'Bad Request'})
    
    var encrypt = new JSEncrypt();
    var crypt = new JSEncrypt({default_key_size: 2048});
    var PublicPrivateKey = {
        PublicKey: crypt.getPublicKey(),
        PrivateKey:crypt.getPrivateKey()
    };

    localStorage.setItem('publicKey', PublicPrivateKey.PublicKey)
    localStorage.setItem('privateKey', PublicPrivateKey.PrivateKey)

    let data = {
        id: 0,
        tod: time.getTime(),
        priority: -1,
        type: "MT_REG",
        username: form_data.username,
        publicKey:  PublicPrivateKey.PublicKey
    }

    const response = await fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(response => {
        if (response.status === 309) throw response
        return response.json()
    }).catch(error => console.error(error))

    console.log(response)
    
    localStorage.setItem('id', response.id)
    
    return response
}

export async function loader() {
    let token = localStorage.getItem('token') 
    let publicKey = localStorage.getItem('publicKey')
    let username = localStorage.getItem('username')

    let data = {
        id: 0,
        tod: time.getTime(),
        priority: -1,
        type: "MT_HELLO",
        token: token,
        username: username,
        publicKey:  publicKey
    }
    const response = await fetch('/hello', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(response => response.json())

    // TODO check ap token
    if (response.type == "MT_HELLO_AGAIN") return redirect('/')
    // TODO check ap token
    if (response.type == "MT_HELLO_ACK") {
        console.log(response)
    }

    // TODO check rejection message and status
    if (response.type == "MT_HELLO_RJT")   throw new Response(response.error , {
                                        status: 400,
                                    });
    
    return null   
}
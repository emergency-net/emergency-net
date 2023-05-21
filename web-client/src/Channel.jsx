import Table from 'react-bootstrap/Table'
import Card from 'react-bootstrap/Card'
import { Form as FormR, useActionData, useNavigate } from 'react-router-dom'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { useEffect, useMemo, useState } from 'react'
import { openDB } from 'idb'
import ListGroup from 'react-bootstrap/ListGroup'
import { LinkContainer } from 'react-router-bootstrap'
import useForceUpdate from 'use-force-update'
import {Buffer} from 'buffer'
import { JSEncrypt } from "jsencrypt"

const time = new Date()

export function Channel({ channelName, messages }) {
    const forceUpdate = useForceUpdate()

    useMemo(() => {
        fetch(`/sync/${channelName}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
            .then(response => response.json())
            .then(keys => {
                let keysNeeded = []
                const existingKeys = []
    
                for (const key of keys) {
                    if (!messages.has(key)) {
                        keysNeeded.push(key)
                    } else {
                        existingKeys.push(key)
                    }
                }
    
                const newMessages = new Map()
                for (const key of messages.keys()) {
                    if (!existingKeys.includes(key)) {
                        newMessages.set(key, messages.get(key))
                    }
                }
    
                return fetch(`/messages/${channelName}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    body: JSON.stringify({
                        keysNeeded: keysNeeded,
                        newMessages: Array.from(newMessages)
                    })
                })
            })
            .then(response => response.json())
            .then(async messagesNeeded => {
                for (const message of messagesNeeded) {
                    messages.set(message[0], message[1])
                }
                const db = await openDB('messageDB', 1)
                const { data } = await db.get('messages_os', 'messages')
                data.set(channelName, messages)
    
                await db.put('messages_os', {
                    name: 'messages',
                    data: data
                })
                forceUpdate()
            })
            .catch(error => console.error(error))
    }, [messages])

    
    return (
        <Card>
            <Card.Header>
                <div className='d-flex justify-content-between'>
                    <p>{channelName}</p>
                    <FormR method='post' action=''>
                        <Form.Group>
                            <Form.Control type="hidden" name='channel' value={channelName} />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Sync Messages
                        </Button>
                    </FormR>

                </div>
            </Card.Header>
            <Card.Body>
                <ListGroup>
                    {Array.from(messages).map(m => (
                        <ListGroup.Item key={messages[0]}>{m}</ListGroup.Item>
                    ))}
                </ListGroup>

                <FormR method='post' action='' className='mt-2'>
                    <Form.Group className='d-flex justify-content-between'>
                        <div className='w-100 me-2'>
                            <Form.Control required type="text" name='message' placeholder="Enter message" />
                        </div>
                        <div>
                            <Button variant="primary" type="submit">
                                Send
                            </Button>
                        </div>

                    </Form.Group>
                    <Form.Group>
                        <Form.Control type="hidden" name='channel' value={channelName} />
                    </Form.Group>
                    <div className='mt-2 d-flex justify-content-evenly'>
                    </div>
                </FormR>
            </Card.Body>
        </Card>
    )
}

export async function action({ request }) {
    const form_data = Object.fromEntries(await request.formData())
    if (!form_data.message) {
        return null
    }
    
    let publicKey = localStorage.getItem('publicKey')
    let privateKey = localStorage.getItem('privateKey')

    // let keyPair = await crypto.subtle.generateKey(
    //     {
    //       name: "RSA-OAEP",
    //       modulusLength: 4096,
    //       publicExponent: new Uint8Array([1, 0, 1]),
    //       hash: "SHA-256",
    //     },
    //     true,
    //     ["encrypt", "decrypt"]
    //   );

    // console.log(crypto.subtle)
    // let melih = await crypto.subtle.encrypt(
    //     {name: "RSA-OAEP"},
    //     keyPair.publicKey,
    //     Buffer.from("kadir")
    //     )
    
    // console.log(melih)
    // let nohut = await crypto.subtle.decrypt(
    //     {name: "RSA-OAEP"},
    //     keyPair.privateKey,
    //     melih
    //     )
    //     var enc = new TextDecoder("utf-8")
    // console.log(enc.decode(nohut))



    // const encrypt = new JSEncrypt();

    // encrypt.setPublicKey(publicKey);
    // let message = encrypt.encrypt("selamm")
    // console.log(message, typeof(message))

    // const decrypt = new JSEncrypt()
    // decrypt.setPrivateKey(privateKey);
    // let result = decrypt.decrypt(message)
    // console.log("result", result)
    let message = form_data.message
    let data = {
        id: localStorage.getItem('id'),
        tod: time.getTime(),
        // TODO add priority
        priority: -1,
        type: "MT_MSG",
        token: localStorage.getItem('token'),
        publicKey: publicKey,
        message: message,
        channel: form_data.channel
    }

    const response = await fetch(`/new-message`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify(data)
        })

    if (response.status !== 201)
        throw response

    return response

}


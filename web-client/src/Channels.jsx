import { useEffect, useState, useMemo } from "react"
import { Form as FormR, useActionData, useLoaderData, useNavigate } from "react-router-dom"
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Nav from 'react-bootstrap/Nav'
import Row from 'react-bootstrap/Row'
import Tab from 'react-bootstrap/Tab'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { Channel, packetSign } from './Channel'
import { openDB } from 'idb'
import axios from 'axios'
import jwt_decode from "jwt-decode";

export function Channels() {
    const [activeCh, setActiveCh] = useState('Erzak 📦')
    const [res, setres] = useState('')
    let { messages } = useLoaderData()
    let data = messages?.data ?? new Map()

    const actionData = useActionData()

    useMemo(() => {
        if (actionData) {
            for (const message of actionData) {
                data.get(activeCh).set(message[0], message[1])
            }

            openDB('messageDB', 1)
                .then(db => {
                    db.put('messages_os', {
                        name: 'messages',
                        data: data
                    })
                })
        }

    }, [actionData, data])

    return (
        <Tab.Container defaultActiveKey={activeCh}>
            <Row>
                <Col md={12} lg={9}>
                    <Tab.Content>
                        {
                            Array.from(data?.keys()).map(ch => (
                                <Tab.Pane key={ch} eventKey={ch}>
                                    <Channel key={ch} channelName={ch} messages={data.get(ch)} />
                                </Tab.Pane>
                            ))
                        }
                    </Tab.Content>
                </Col>
                <Col lg={3}>
                    <Card className='mt-2 mt-lg-0'>
                        <Card.Body>
                            <Nav fill variant="pills" className="flex-column">
                                {
                                    Array.from(data?.keys()).map(ch => (
                                        <Nav.Item key={ch}>
                                            <Nav.Link key={ch} eventKey={ch} onClick={() => {
                                                setActiveCh(ch)
                                            }}>
                                                {ch}
                                            </Nav.Link>
                                        </Nav.Item>
                                    ))
                                }
                            </Nav>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row>
            <Col md={12} lg={4}>
                Create Channel
            <FormR method='post'  className='mt-2' onSubmit={(e)=>createChannel(e, setres)}>
                    <Form.Group className='d-flex justify-content-between'>
                        <div className='w-100 me-2'>
                            <Form.Control required type="text" id="channel" name='channel' placeholder="Enter the channel name" />
                        </div>
                        <div>
                            <Button variant="primary" type="submit">
                                Create
                            </Button>
                        </div>
                    </Form.Group>
                    
            </FormR>
            </Col>
            </Row>
            <Row>
            <Col md={12} lg={4}>
                Destroy Channel
            <FormR method='post'  className='mt-2' onSubmit={(e)=>destroyChannel(e, setres)}>
                    <Form.Group className='d-flex justify-content-between'>
                        <div className='w-100 me-2'>
                            <Form.Control required type="text" id="channel" name='channel' placeholder="Enter the channel name" />
                        </div>
                        <div>
                            <Button variant="primary" type="submit">
                                Create
                            </Button>
                        </div>
                    </Form.Group>
                    
            </FormR>
            </Col>
            </Row>
            <Row>
            <Col md={12} lg={4}>
                Disable AP
            <FormR method='post'  className='mt-2' onSubmit={(e)=>disableAP(e, setres)}>
                    <Form.Group className='d-flex justify-content-between'>
                        <div className='w-100 me-2'>
                            <Form.Control required type="text" id="APName" name='APName' placeholder="Enter the AP name" />
                        </div>
                        <div>
                            <Button variant="primary" type="submit">
                                Create
                            </Button>
                        </div>
                    </Form.Group>
                    
            </FormR>
            </Col>
            </Row>
            <Row>
            <Col md={12} lg={4}>
                Disable PU
            <FormR method='post'  className='mt-2' onSubmit={(e)=>disablePU(e, setres)}>
                    <Form.Group className='d-flex justify-content-between'>
                        <div className='w-100 me-2'>
                            <Form.Control required type="text" id="PUName" name='PUName' placeholder="Enter the PU name" />
                        </div>
                        <div>
                            <Button variant="primary" type="submit">
                                Create
                            </Button>
                        </div>
                    </Form.Group>
                    
            </FormR>
            </Col>
            </Row>
            {res?  <div>
                {res}
            </div>:<div/>}
        </Tab.Container>
    )
}

export async function loader() {
    const db = await openDB('messageDB', 1)
    const messages = await db.get('messages_os', 'messages')
    // console.log(messages)
    return { messages }
}

export async function createChannel(e, setres) {
    if (! e.target.channel) {
        return null
    }
    console.log(e.target.channel.value)
    
    let APPublicKey = localStorage.getItem('APPublicKey')
    let privateKey = localStorage.getItem('privateKey')
    let publicKey = localStorage.getItem('publicKey')
    const messagePacket = {
        id: localStorage.getItem('id'),
        tod: Date.now(),
        channel: e.target.channel.value
    }

    let packetString = JSON.stringify(messagePacket)
    const signature = packetSign(packetString, privateKey) 

    let data = {
        id: localStorage.getItem('id'),
        tod: Date.now(),
        // TODO add priority
        priority: -1,
        type: "CH_CREATE",
        token: localStorage.getItem('token'),
        publicKey: publicKey,
        packet: packetString,
        signature: signature,
    }
    
    const response = await axios.post('/create-channel', data, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    });
    
    
    if (response.data.type == "CH_CREATE_ACK"){
        setres("SUCCESSFUL")
    }
    else{
        setres(response.data.error)
        throw response
    }
    
    // Token public key is the same with the packet
    
    let packet = JSON.parse(response.data.packet)
    let decoded = jwt_decode(packet.id)
    
    if (decoded.apPublicKey.replaceAll("\n", "") !== response.data.apPublicKey.replaceAll("\n", "")){
        console.log("Public Keys does not match.")
        console.log(decoded.apPublicKey.replaceAll("\n", ""), response.data.apPublicKey.replaceAll("\n", ""))
    }

    const db = await openDB('messageDB', 1, {
        upgrade(db) {
            db.createObjectStore('messages_os', { keyPath: 'name' })
        }
    })
    const messages = await db.get('messages_os', 'messages')
    messages.data.set(e.target.channel.value, new Map())
    await db.put('messages_os', {
        name: 'messages',
        data: messages.data
    })
 

    

    return response

}

export async function destroyChannel(e, setres) {
    if (! e.target.channel) {
        return null
    }
    console.log(e.target.channel.value)
    
    let APPublicKey = localStorage.getItem('APPublicKey')
    let privateKey = localStorage.getItem('privateKey')
    let publicKey = localStorage.getItem('publicKey')

    const messagePacket = {
        id: localStorage.getItem('id'),
        tod: Date.now(),
        channel: e.target.channel.value
    }

    let packetString = JSON.stringify(messagePacket)
    const signature = packetSign(packetString, privateKey) 

    let data = {
        id: localStorage.getItem('id'),
        tod: Date.now(),
        // TODO add priority
        priority: -1,
        type: "CH_DESTROY",
        token: localStorage.getItem('token'),
        publicKey: publicKey,
        packet: packetString,
        signature: signature,
    }

    const db = await openDB('messageDB', 1, {
        upgrade(db) {
            db.createObjectStore('messages_os', { keyPath: 'name' })
        }
    })
    const messages = await db.get('messages_os', 'messages')
    messages.data.delete(e.target.channel.value)
    await db.put('messages_os', {
        name: 'messages',
        data: messages.data
    })

    const response = await axios.post('/destroy-channel', data, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
        });
   if (response.data.type == "CH_DESTROY_ACK"){
        setres("SUCCESSFUL")
    }
    else{
        setres(response.data.error)
        throw response
    }
    
    
    let packet = JSON.parse(response.data.packet)
    let decoded = jwt_decode(packet.id)
    // Token public key is the same with the packet
    if (decoded.apPublicKey.replaceAll("\n", "") !== response.data.apPublicKey.replaceAll("\n", "")){
        console.log("Public Keys does not match.")
        console.log(decoded.apPublicKey.replaceAll("\n", ""), response.data.apPublicKey.replaceAll("\n", ""))
    }


    return response

}
export async function disableAP(e, setres) {
    if (! e.target.APName) {
        return null
    }
    console.log(e.target.APName.value)
    
    let APPublicKey = localStorage.getItem('APPublicKey')
    let privateKey = localStorage.getItem('privateKey')
    let publicKey = localStorage.getItem('publicKey')

    const messagePacket = {
        id: localStorage.getItem('id'),
        tod: Date.now(),
        APName: e.target.APName.value
    }

    let packetString = JSON.stringify(messagePacket)
    const signature = packetSign(packetString, privateKey) 

    let data = {
        id: localStorage.getItem('id'),
        tod: Date.now(),
        // TODO add priority
        priority: -1,
        type: "AP_DISABLE",
        token: localStorage.getItem('token'),
        publicKey: publicKey,
        packet: packetString,
        signature: signature,
    }

    const response = await axios.post('/disable-ap', data, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
        });
    if (response.data.type == "AP_DISABLE_ACK"){
        setres("SUCCESSFUL")
    }
    else{
        setres(response.data.error)
        throw response
    }
    
    // Token public key is the same with the packet
    
    let packet = JSON.parse(response.data.packet)
    let decoded = jwt_decode(packet.id)
    if (decoded.apPublicKey.replaceAll("\n", "") !== response.data.apPublicKey.replaceAll("\n", "")){
        console.log("Public Keys does not match.")
        console.log(decoded.apPublicKey.replaceAll("\n", ""), response.data.apPublicKey.replaceAll("\n", ""))
    }
    
    return response

}
export async function disablePU(e, setres) {
    if (! e.target.PUName) {
        return null
    }
    console.log(e.target.PUName.value)
    
    let APPublicKey = localStorage.getItem('APPublicKey')
    let privateKey = localStorage.getItem('privateKey')
    let publicKey = localStorage.getItem('publicKey')

    const messagePacket = {
        id: localStorage.getItem('id'),
        tod: Date.now(),
        PUName: e.target.PUName.value
    }

    let packetString = JSON.stringify(messagePacket)
    const signature = packetSign(packetString, privateKey) 

    let data = {
        id: localStorage.getItem('id'),
        tod: Date.now(),
        // TODO add priority
        priority: -1,
        type: "PU_DISABLE",
        token: localStorage.getItem('token'),
        publicKey: publicKey,
        packet: packetString,
        signature: signature,
    }

    const response = await axios.post('/disable-pu', data, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
        });
    
    if (response.data.type == "PU_DISABLE_ACK"){
        setres("SUCCESSFUL")
    }
    else{
        setres(response.data.error)
        throw response
    }
    
    // TODO verify jwt 
    let packet = JSON.parse(response.data.packet)
    let decoded = jwt_decode(packet.id)
    // Token public key is the same with the packet
    if (decoded.apPublicKey.replaceAll("\n", "") !== response.data.apPublicKey.replaceAll("\n", "")){
        console.log("Public Keys does not match.")
        console.log(decoded.apPublicKey.replaceAll("\n", ""), response.data.apPublicKey.replaceAll("\n", ""))
    }
    
    return response

}

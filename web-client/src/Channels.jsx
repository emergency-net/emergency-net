import { useEffect, useState, useMemo } from "react"
import { useActionData, useLoaderData, useNavigate } from "react-router-dom"
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Nav from 'react-bootstrap/Nav'
import Row from 'react-bootstrap/Row'
import Tab from 'react-bootstrap/Tab'
import { Channel } from './Channel'
import { openDB } from 'idb'

export function Channels() {
    const [activeCh, setActiveCh] = useState('Erzak 📦')
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
        </Tab.Container>
    )
}

export async function loader() {
    const db = await openDB('messageDB', 1)
    const messages = await db.get('messages_os', 'messages')
    console.log(messages)
    return { messages }
}
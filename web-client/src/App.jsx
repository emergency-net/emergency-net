import { useEffect } from 'react'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { Outlet, useActionData, useLoaderData, useNavigate } from 'react-router-dom'
import { TopBar } from './TopBar'
import { openDB } from 'idb'

export function App() {
    const navigate = useNavigate()
    const { token } = useLoaderData()

    useEffect(() => {
        if (!token) {
            navigate('/register')
        } else {
            
        }
    }, [token])

    return (
        <>
            <TopBar />
            <Container className='mt-5'>
                <Row className='justify-content-between'>
                    <Col className='col-xs-12'>
                        <Outlet />
                    </Col>
                </Row>
            </Container>
        </>
    )
}

export async function loader() {
    const db = await openDB('messageDB', 1, {
        upgrade(db) {
            db.createObjectStore('messages_os', { keyPath: 'name' })
        }
    })
    
    if (!(await db.get('messages_os', 'messages'))) {
        await db.put('messages_os', {
            name: 'messages',
            data: new Map([
                ['Erzak 📦', new Map()],
                ['Barınma 🏡', new Map()],
                ['Son dakika gelişmeleri 📢', new Map()],
                ['Sağlık ve ilk yardım ⚕', new Map()],
                ['Emergency-net geri bildirim 💭', new Map()]
            ])
        })
    }

    const token = localStorage.getItem('token')
    return { token }
}
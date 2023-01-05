import { useEffect } from 'react'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { Outlet, useLoaderData, useNavigate } from 'react-router-dom'
import { TopBar } from './TopBar'

export function App() {
    const navigate = useNavigate()
    const { token } = useLoaderData()

    useEffect(() => {
        if (!token) {
            navigate('/register')
        }
    }, [token])

    return (
        <>
            <TopBar />
            <Container className='mt-5'>
                <Row className='flex-column align-items-center'>
                    <Col className='w-50'>
                        <Outlet />
                    </Col>
                </Row>
            </Container>
        </>
    )
}

export function loader() {
    const token = localStorage.getItem('token')

    return { token }
}
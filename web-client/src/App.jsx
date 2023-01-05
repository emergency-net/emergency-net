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
                <Row className='justify-content-center'>
                    <Col className='col-sm-12 col-md-8'>
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
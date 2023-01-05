import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { LinkContainer } from 'react-router-bootstrap'

export function TopBar() {
    return (
        <Navbar bg="light">
            <Container className='justify-content-center'>
                <Navbar.Brand className='' href="/">emergency-net</Navbar.Brand>
                <Nav>
                    <LinkContainer to='/'>
                        <Nav.Link>Home</Nav.Link>
                    </LinkContainer>

                    <LinkContainer to='/about'>
                        <Nav.Link>About</Nav.Link>
                    </LinkContainer>
                </Nav>
            </Container>
        </Navbar>
    );
}

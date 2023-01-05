import { Form as FormR } from 'react-router-dom'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Card from 'react-bootstrap/Card'

export function Register() {
    return (
        <Card>
            <Card.Body className='align-items-center'>
                <FormR method='post' action='/register'>
                    <Form.Group className='w-75 mx-auto'>
                        <Form.Label>Username</Form.Label>
                        <Form.Control type="text" placeholder="Enter username" />
                        <Form.Text className="text-muted">
                            Your username needs to be unique in this access point.
                        </Form.Text>
                    </Form.Group>
                    <div className='d-flex justify-content-center'>
                        <Button variant="primary" type="submit">
                            Submit
                        </Button>
                    </div>
                </FormR>
            </Card.Body>
        </Card >

    )
}
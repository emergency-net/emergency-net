import { useRouteError } from 'react-router-dom'
import Alert from 'react-bootstrap/Alert'

export function Error() {
    const error = useRouteError()
    return (
        <Alert key='warning' variant='warning'>
            {error.status + ' - ' + error.statusText}
        </Alert>
    )
}
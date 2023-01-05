import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { App, loader as AppLoader } from './App'
import { Register, action as registerAction } from './Register'
import { Error } from './Error'

import 'bootstrap/dist/css/bootstrap.min.css'

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        loader: AppLoader,
        children: [
            {
                path: '/register',
                element: <Register />,
                errorElement: <Error />,
                action: registerAction
            }
        ]
    },
])

ReactDOM.createRoot(document.querySelector('#root'))
    .render(<RouterProvider router={router} />)
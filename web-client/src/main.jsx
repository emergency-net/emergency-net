import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { App, loader as AppLoader } from './App'
import { Register, action as registerAction, loader as registerLoader } from './Register'
import { Error } from './Error'
import { Channels, loader as channelsLoader } from './Channels'
import { Channel, action as channelAction } from './Channel'

import 'bootstrap/dist/css/bootstrap.min.css'

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        loader: AppLoader,
        children: [
            {
                path: 'register',
                element: <Register />,
                // errorElement: <Error />,
                action: registerAction,
                loader: registerLoader
            },
            {
                index: true,
                element: <Channels />,
                loader: channelsLoader,
                action: channelAction,
            }
        ]
    },
])

ReactDOM.createRoot(document.querySelector('#root'))
    .render(<RouterProvider router={router} />)
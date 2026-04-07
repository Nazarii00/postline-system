import { createBrowserRouter } from 'react-router-dom'
import PublicLayout from '../components/layout/PublicLayout'
import HomePage from '../pages/public/HomePage'

export const router = createBrowserRouter([
  {
    element: <PublicLayout/>,
    children: [
      { path: '/',      element: <HomePage /> },
    ],
  },
])
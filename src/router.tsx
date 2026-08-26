import { Navigate, createBrowserRouter } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Trades from './pages/Trades'
import Journal from './pages/Journal'
import RequireAuth from './components/RequireAuth'

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <Layout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'trades', element: <Trades /> },
      { path: 'journal', element: <Journal /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])

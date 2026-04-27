import { createBrowserRouter } from 'react-router-dom'
import PublicLayout from '../components/layout/PublicLayout'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import HomePage from '../pages/public/HomePage'
import AuthPage from '../pages/public/AuthPage'
import ClientDashboard from '../pages/client/ClientDashboard'
import TrackingPage from '../pages/public/TrackingPage'
import TariffsPage from '../pages/public/TariffsPage'
import BranchesPage from '../pages/public/BranchesPage'
import NewShipmentPage from '../pages/operator/NewShipmentPage'
import OperatorLayout from '../components/layout/OperatorLayout'
import NotificationsPage from '../pages/client/NotificationPage'
import ProfilePage from '../pages/client/ProfilePage'
import StatusChangePage from '../pages/operator/StatusChangePage'
import OperatorShipmentsPage from '../pages/operator/OperatorShipmentsPage'
import CourierDeliveryPage from '../pages/operator/CourierDeliveryPage'
import CourierDeliveriesPage from '../pages/courier/CourierDeliveriesPage'
import RoutesPage from '../pages/operator/RoutesPage'
import AdminLayout from '../components/layout/AdminLayout'
import OverviewPage from '../pages/admin/OverviewPage'
import OperatorsPage from '../pages/admin/OperatorsPage'
import OfficesPage from '../pages/admin/OfficesPage'
import ReportsPage from '../pages/admin/ReportsPage'
import AllShipmentsPage from '../pages/admin/AllShipmentsPage'
import ControlTariffsPage from '../pages/admin/ControlTarrifsPage'
import ClientLayout from '../components/layout/ClientLayout'
import ShipmentDetailPage from '../pages/client/ShipmentDetailPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout/>,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'auth', element: <AuthPage /> },
      { path: 'tracking', element: <TrackingPage /> },
      { path: 'tariffs', element: <TariffsPage /> },
      { path: 'branches', element: <BranchesPage/> },
    ],
  },
  {
    path: '/client',
    element: <ProtectedRoute element={<ClientLayout />} allowedRoles={['client']} />,
    children: [
      { index: true, element: <ClientDashboard/> },
      { path: 'tracking', element: <TrackingPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'shipment/:id', element: <ShipmentDetailPage /> },
    ],
  },
  {
    path: '/operator',
    element: <ProtectedRoute element={<OperatorLayout />} allowedRoles={['operator', 'courier']} />,
    children: [
      {
        index: true,
        element: <ProtectedRoute element={<OperatorShipmentsPage/>} allowedRoles={['operator']} />
      },
      {
        path: 'new-shipment',
        element: <ProtectedRoute element={<NewShipmentPage />} allowedRoles={['operator']} />
      },
      {
        path: 'status-change',
        element: <ProtectedRoute element={<StatusChangePage/>} allowedRoles={['operator']} />
      },
      {
        path: 'courier-delivery',
        element: <ProtectedRoute element={<CourierDeliveryPage/>} allowedRoles={['operator', 'courier']} />
      },
      {
        path: 'routes',
        element: <ProtectedRoute element={<RoutesPage />} allowedRoles={['operator']} />
      },
      {
        path: 'shipment/:id',                                          // ← додано
        element: <ProtectedRoute element={<ShipmentDetailPage />} allowedRoles={['operator']} />
      },
    ],
  },
  {
    path: '/courier',
    element: <ProtectedRoute element={<OperatorLayout />} allowedRoles={['courier']} />,
    children: [
      { index: true, element: <CourierDeliveriesPage /> },
    ],
  },
  {
    path: '/admin',
    element: <ProtectedRoute element={<AdminLayout />} allowedRoles={['admin']} />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: 'operators', element: <OperatorsPage /> },
      { path: 'offices', element: <OfficesPage /> },
      { path: 'tariffs', element: <ControlTariffsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'shipments', element: <AllShipmentsPage /> },
      { path: 'shipment/:id', element: <ShipmentDetailPage /> },
    ],
  },
])

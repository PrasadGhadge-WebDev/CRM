import { Navigate, Route, Routes, Outlet } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'
import AppLayout from './layouts/AppLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Profile from './pages/Profile.jsx'
import Search from './pages/Search.jsx'
import Settings from './pages/Settings.jsx'
import NotificationsList from './modules/crm/pages/NotificationsList.jsx'
import CompaniesList from './modules/crm/pages/CompaniesList.jsx'
import CompanyForm from './modules/crm/pages/CompanyForm.jsx'
import CustomersList from './modules/crm/pages/CustomersList.jsx'
import CustomerDetail from './modules/crm/pages/CustomerDetail.jsx'
import CustomerForm from './modules/crm/pages/CustomerForm.jsx'
import LeadsList from './modules/crm/pages/LeadsList.jsx'
import LeadForm from './modules/crm/pages/LeadForm.jsx'
import LeadDetail from './modules/crm/pages/LeadDetail.jsx'
import LeadNotes from './modules/crm/pages/LeadNotes.jsx'
import TasksList from './modules/crm/pages/TasksList.jsx'
import DealsList from './modules/crm/pages/DealsList.jsx'
import DealForm from './modules/crm/pages/DealForm.jsx'
import DealDetail from './modules/crm/pages/DealDetail.jsx'
import OrdersList from './modules/crm/pages/OrdersList.jsx'
import SupportList from './modules/crm/pages/SupportList.jsx'
import ProductsList from './modules/crm/pages/ProductsList.jsx'
import ProductForm from './modules/crm/pages/ProductForm.jsx'
import UsersList from './modules/crm/pages/UsersList.jsx'
import UserForm from './modules/crm/pages/UserForm.jsx'
import MasterData from './modules/crm/pages/MasterData.jsx'
import Reports from './modules/crm/pages/Reports.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute.jsx'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<NotificationsList />} />
          <Route path="/search" element={<Search />} />

          <Route
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Manager', 'Sales']}>
                <Outlet />
              </ProtectedRoute>
            }
          >
            <Route path="/customers" element={<CustomersList />} />
            <Route path="/customers/new" element={<CustomerForm mode="create" />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/customers/:id/edit" element={<CustomerForm mode="edit" />} />

            <Route path="/leads" element={<LeadsList />} />
            <Route path="/leads/new" element={<LeadForm mode="create" />} />
            <Route path="/leads/:id/edit" element={<LeadForm mode="edit" />} />
            <Route path="/leads/:id" element={<LeadDetail />} />
            <Route path="/lead-notes" element={<LeadNotes />} />
            <Route path="/tasks" element={<TasksList />} />

            <Route path="/deals" element={<DealsList />} />
            <Route path="/deals/new" element={<DealForm mode="create" />} />
            <Route path="/deals/:id" element={<DealDetail />} />
            <Route path="/deals/:id/edit" element={<DealForm mode="edit" />} />

            <Route path="/orders" element={<OrdersList />} />
            <Route path="/support" element={<SupportList />} />
            <Route path="/products" element={<ProductsList />} />
            <Route path="/products/new" element={<ProductForm mode="create" />} />
            <Route path="/products/:id/edit" element={<ProductForm mode="edit" />} />
          </Route>

          <Route
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
                <Outlet />
              </ProtectedRoute>
            }
          >
            <Route path="/companies" element={<CompaniesList />} />
            <Route path="/companies/new" element={<CompanyForm mode="create" />} />
            <Route path="/companies/:id" element={<CompanyForm mode="edit" />} />
          </Route>

          <Route
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Outlet />
              </ProtectedRoute>
            }
          >
            <Route path="/users" element={<UsersList />} />
            <Route path="/users/new" element={<UserForm mode="create" />} />
            <Route path="/users/:id" element={<UserForm mode="edit" />} />
            <Route path="/master-data" element={<MasterData />} />
            <Route path="/reports" element={<Reports />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </AuthProvider>
  )
}

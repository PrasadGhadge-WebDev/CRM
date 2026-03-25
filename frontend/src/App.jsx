import { Navigate, Route, Routes, Outlet } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'
import AppLayout from './layouts/AppLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AccessDenied from './pages/AccessDenied.jsx'
import CustomersList from './modules/crm/pages/CustomersList.jsx'
import CustomerDetail from './modules/crm/pages/CustomerDetail.jsx'
import CustomerForm from './modules/crm/pages/CustomerForm.jsx'
import LeadsList from './modules/crm/pages/LeadsList.jsx'
import LeadForm from './modules/crm/pages/LeadForm.jsx'
import LeadDetail from './modules/crm/pages/LeadDetail.jsx'
import DealsList from './modules/crm/pages/DealsList.jsx'
import DealForm from './modules/crm/pages/DealForm.jsx'
import DealDetail from './modules/crm/pages/DealDetail.jsx'
import UsersList from './modules/crm/pages/UsersList.jsx'
import UserDetail from './modules/crm/pages/UserDetail.jsx'
import UserForm from './modules/crm/pages/UserForm.jsx'
import TrashList from './modules/crm/pages/TrashList.jsx'
import Reports from './modules/crm/pages/Reports.jsx'
import TasksList from './modules/crm/pages/TasksList.jsx'
import LeadNotes from './modules/crm/pages/LeadNotes.jsx'
import Billing from './modules/crm/pages/Billing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { ROLE_GROUPS } from './utils/accessControl'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/access-denied" element={<AccessDenied />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />

          <Route
            element={
              <ProtectedRoute allowedRoles={ROLE_GROUPS.allAuthenticated}>
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

            <Route path="/deals" element={<DealsList />} />
            <Route path="/deals/new" element={<DealForm mode="create" />} />
            <Route path="/deals/:id" element={<DealDetail />} />
            <Route path="/deals/:id/edit" element={<DealForm mode="edit" />} />
            <Route path="/trash" element={<TrashList />} />
          </Route>

          <Route
            element={
              <ProtectedRoute allowedRoles={ROLE_GROUPS.admins}>
                <Outlet />
              </ProtectedRoute>
            }
          >
            <Route path="/users" element={<UsersList />} />
            <Route path="/users/new" element={<UserForm mode="create" />} />
            <Route path="/users/:id" element={<UserDetail />} />
            <Route path="/users/:id/edit" element={<UserForm mode="edit" />} />
            <Route path="/billing" element={<Billing />} />
          </Route>

          <Route
            element={
              <ProtectedRoute allowedRoles={ROLE_GROUPS.reportsAccess}>
                <Outlet />
              </ProtectedRoute>
            }
          >
            <Route path="/reports" element={<Reports />} />
          </Route>

          <Route
            element={
              <ProtectedRoute allowedRoles={ROLE_GROUPS.tasksAccess}>
                <Outlet />
              </ProtectedRoute>
            }
          >
            <Route path="/tasks" element={<TasksList />} />
          </Route>

          <Route
            element={
              <ProtectedRoute allowedRoles={ROLE_GROUPS.followupsAccess}>
                <Outlet />
              </ProtectedRoute>
            }
          >
            <Route path="/followups" element={<LeadNotes />} />
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

import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import AppLayout from './layouts/AppLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Search from './pages/Search.jsx'
import CustomersList from './modules/crm/pages/CustomersList.jsx'
import CustomerForm from './modules/crm/pages/CustomerForm.jsx'
import LeadsList from './modules/crm/pages/LeadsList.jsx'
import LeadForm from './modules/crm/pages/LeadForm.jsx'
import LeadDetail from './modules/crm/pages/LeadDetail.jsx'
import LeadNotes from './modules/crm/pages/LeadNotes.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="/search" element={<Search />} />

        <Route path="/customers" element={<CustomersList />} />
        <Route path="/customers/new" element={<CustomerForm mode="create" />} />
        <Route path="/customers/:id" element={<CustomerForm mode="edit" />} />

        <Route path="/leads" element={<LeadsList />} />
        <Route path="/leads/new" element={<LeadForm mode="create" />} />
        <Route path="/leads/:id/edit" element={<LeadForm mode="edit" />} />
        <Route path="/leads/:id" element={<LeadDetail />} />

        <Route path="/lead-notes" element={<LeadNotes />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

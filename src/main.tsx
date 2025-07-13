import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App, { ExamplePage } from './App';
import ClientDashboard from './components/ClientDashboard';
import AdminDashboard from './components/AdminDashboard';
import AuthForm from './components/AuthForm';
import SubscriptionPage from './components/SubscriptionPage';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<AuthForm />} />
        <Route path="/client" element={<ClientDashboard />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/moussabfatmimariem" element={<AdminDashboard />} />
        <Route path="/example" element={<ExamplePage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);

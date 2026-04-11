<<<<<<< Updated upstream
import './App.css'
import TeacherDashboard from './pages/TeacherDashboard'
import { BrowserRouter as Router } from 'react-router-dom'

function App() {
  return (
    <Router>
      <TeacherDashboard />
    </Router>
  )
=======
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
>>>>>>> Stashed changes
}

export default App;

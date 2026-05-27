import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { NegocioProvider } from './context/NegocioContext.jsx';
import AppRouter from './router/AppRouter.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NegocioProvider>
          <AppRouter />
        </NegocioProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

import './App.css'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { useState, useMemo } from 'react'
import Register from './components/Register'
import Login from './components/Login'
import Home from './components/Home'
import Navbar from './components/Navbar'
import About from './components/About'
import Clients from './components/Clients'
import Fournisseurs from './components/Fournisseurs'
import Produits from './components/Produits'
import Categories from './components/Categories'
import MouvementsStock from './components/MouvementsStock'
import Ventes from './components/Ventes'
import Rapports from './components/Rapports'
import AuditLog from './components/AuditLog'
import Utilisateurs from './components/Utilisateurs'
import Entrepots from './components/Entrepots'
import StockEntrepot from './components/StockEntrepot'
import Transferts from './components/Transferts'
import HistoriqueClient from './components/HistoriqueClient'
import Statistiques from './components/Statistiques'
import Dashboard from './components/Dashboard'
import RapportPaiements from './components/RapportPaiements'
import { Routes, Route , useLocation} from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoutes'
import PasswordResetRequest from './components/PasswordResetRequest'
import PasswordReset from './components/PasswordReset'
import NotFound from './components/NotFound';
function App() {
  const [mode, setMode] = useState('light')
  const location = useLocation()

  // Gestion du changement de thème
  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))
  }

  // Création du thème avec memoisation
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                // Palette pour le mode clair
                primary: {
                  main: '#1976d2',
                  light: '#42a5f5',
                  dark: '#1565c0',
                },
                secondary: {
                  main: '#dc004e',
                  light: '#ff5983',
                  dark: '#9a0036',
                },
                background: {
                  default: '#f8f9fa',
                  paper: '#ffffff',
                },
                text: {
                  primary: '#1a1a1a',
                  secondary: '#6c757d',
                },
              }
            : {
                // Palette pour le mode sombre
                primary: {
                  main: '#90caf9',
                  light: '#e3f2fd',
                  dark: '#42a5f5',
                },
                secondary: {
                  main: '#f48fb1',
                  light: '#fce4ec',
                  dark: '#ad1457',
                },
                background: {
                  default: '#121212',
                  paper: '#1e1e1e',
                },
                text: {
                  primary: '#ffffff',
                  secondary: '#b0b0b0',
                },
              }),
        },
        typography: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          h6: {
            fontWeight: 600,
          },
          button: {
            textTransform: 'none',
            fontWeight: 500,
          },
        },
        shape: {
          borderRadius: 8,
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                borderRight: 'none',
                boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
              },
            },
          },
        },
      }),
    [mode],
  )

  // Correction : inverser la condition
  const noNavBar = location.pathname === "/" || location.pathname === "/register" || location.pathname.includes("password")
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {
        noNavBar ?
        // Pas de Navbar pour login et register
        <Routes>
          <Route path="/register" element={<Register />} />
         <Route path="/" element={<Login />} />
          <Route path="/request/password_reset" element={<PasswordResetRequest/>}/>
          <Route path="/password-reset/:token" element={<PasswordReset/>}/>
      </Routes>
        :
        // Avec Navbar pour les autres routes
        <Navbar 
          content={
            <Routes>
              <Route element={<ProtectedRoute/>}> 
                <Route path="/home" element={<Home/>}/>
                <Route path="/about" element={<About/>}/>
                <Route path="/clients" element={<Clients/>}/>
                <Route path="/fournisseurs" element={<Fournisseurs/>}/>
                <Route path="/produits" element={<Produits/>}/>
                <Route path="/categories" element={<Categories/>}/>
                <Route path="/mouvements-stock" element={<MouvementsStock/>}/>
                <Route path="/ventes" element={<Ventes/>}/>
                <Route path="/rapports" element={<Rapports/>}/>
                <Route path="/audit" element={<AuditLog/>}/>
                <Route path="/utilisateurs" element={<Utilisateurs/>}/>
                <Route path="/dashboard" element={<Dashboard/>}/>
                <Route path="/entrepots" element={<Entrepots/>}/>
                 <Route path="/stock-entrepot" element={<StockEntrepot/>}/>
                  <Route path="/transferts" element={<Transferts/>}/>
                  <Route path="/historique-client" element={<HistoriqueClient/>}/>
                   <Route path="/rapport-paiements" element={<RapportPaiements/>}/>
                    <Route path="/statistiques" element={<Statistiques/>}/>
                     {/* Ajoutez une route pour les 404 */}
                     <Route path="*" element={<NotFound />} />
              </Route>
            </Routes> 
          }
          mode={mode}
          toggleColorMode={toggleColorMode}
        />
      }
    </ThemeProvider>
  )
}

export default App


//import Parametres from './components/Parametres'

// Dans la section des routes protégées
// <Route path="/parametres" element={<Parametres/>}/>
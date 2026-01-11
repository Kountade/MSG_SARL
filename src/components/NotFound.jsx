// src/components/NotFound.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirige automatiquement après 5 secondes
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  return (
    <div>
      <h1>404 - Page non trouvée</h1>
      <p>Vous serez redirigé vers l'accueil dans 5 secondes...</p>
    </div>
  );
}

// AJOUTEZ CETTE LIGNE (très importante) :
export default NotFound;
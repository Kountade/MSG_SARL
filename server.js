// server.js à la racine
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'dist')));

// API proxy vers votre backend
app.use('/api', async (req, res) => {
  try {
    const backendUrl = `https://msg-sarl-backeng.onrender.com${req.url}`;
    console.log('Proxying to:', backendUrl);
    
    // Simple redirect pour les API calls
    res.redirect(backendUrl);
  } catch (error) {
    res.status(500).json({ error: 'Proxy error' });
  }
});

// TOUTES les routes -> index.html (SPA)
app.get('*', (req, res) => {
  console.log(`📦 Serving SPA route: ${req.path}`);
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`📁 Serving from: ${path.join(__dirname, 'dist')}`);
});
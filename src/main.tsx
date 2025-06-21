import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Importa o seu componente principal App
import './index.css'; // Importa seu CSS global, se existir

// Encontra o elemento 'root' no seu index.html e renderiza o App nele
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

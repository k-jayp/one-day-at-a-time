import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import App from './App';
import './index.css';

let root: Root | null = null;

function mountGrowthGames(container: HTMLElement) {
  if (!root) {
    root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
}

// Expose mount function globally for the main site to call
(window as any).mountGrowthGames = mountGrowthGames;

// Auto-mount if the element already exists
const autoMount = document.getElementById('react-games-root');
if (autoMount) {
  mountGrowthGames(autoMount);
}

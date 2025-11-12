import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'


// TODO : Configure zustand persist
createRoot(document.getElementById('root')).render(
  <>
    <App />
  </>,
)

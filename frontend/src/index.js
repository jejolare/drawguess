import ReactDOM from 'react-dom/client';
import App from './App';
import { StoreProvider } from "./store/store-reducer";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <StoreProvider>
        <App />
    </StoreProvider>
);


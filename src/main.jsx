import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import { Provider } from "./components/ui/provider"

//able to preserve state of rendered data (no need to fetch API over and over again)



//globalizes variables
//able to preserve state of rendered data (no need to fetch API over and over again)
const queryClient = new QueryClient()



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
 <React.StrictMode>
    <Provider>
      <QueryClientProvider client={queryClient}>
        <App />
       </QueryClientProvider>
    </Provider>
 </React.StrictMode>
);

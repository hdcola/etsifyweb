import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';
import { Home } from './pages/Home';
import { Container } from '@mui/material';

function App() {
    const queryClient = new QueryClient();

    return (
        <Container>
            <QueryClientProvider client={queryClient}>
                <Router>
                    <Routes>
                        <Route path="/" element={<Home />} />
                    </Routes>
                </Router>
            </QueryClientProvider>
        </Container>
    );
}

export default App;

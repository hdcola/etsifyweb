import {useState} from 'react';
import { Stack, Box } from '@mui/material';
import SideNav from '../components/Dashboard/SideNav';
import ManageItems from '../components/Dashboard/ManageItems';
import ManageOrders from '../components/Dashboard/ManageOrders';
import DashboardMain from '../components/Dashboard/DashboardMain';

export const StoreDashboard = () => {
    const [selectedComponent, setSelectedComponent] = useState('dashboard');

    const renderContent = () => {
        switch (selectedComponent) {
            case 'items':
                return <ManageItems />;
            case 'orders':
                return <ManageOrders />;
            default:
                return <DashboardMain />;
        }
    };

    return (
        <Stack>
            <SideNav setSelectedComponent={setSelectedComponent} />
            <Box>
                {renderContent()}
            </Box>
        </Stack>
    );
};

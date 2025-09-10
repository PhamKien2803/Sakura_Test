import {
    createTheme, ThemeProvider, CssBaseline
} from '@mui/material';
import { Header } from '../pages/HomePage/Header';
import Footer from '../pages/HomePage/Footer';
import { ContactInfo } from '../pages/Registration/ContactInfo';
import { ContactForm } from '../pages/Registration/ContactForm';
import { Box } from '@mui/system';



const elegantTheme = createTheme({
    palette: {
        primary: { main: '#E5A3B3', light: '#fce4ec' },
        secondary: { main: '#A0C4B8' },
        background: { default: '#f2fafe', paper: '#FFFFFF' },
        text: { primary: '#5D4037', secondary: '#8D6E63' },
        success: { main: '#A0C4B8' },
        warning: { main: '#FFDAB9' },
        info: { main: '#B2DFDB' },
        error: { main: '#FFCDD2' },
    },
    typography: {
        fontFamily: '"Nunito Sans", sans-serif',
        h1: { fontFamily: '"Lora", serif', fontWeight: 600, fontSize: '3.2rem' },
        h2: { fontFamily: '"Lora", serif', fontWeight: 600, fontSize: '3rem' },
        h3: { fontFamily: '"Lora", serif', fontWeight: 600, fontSize: '2.2rem' },
        h4: { fontFamily: '"Lora", serif', fontWeight: 600, fontSize: '1.8rem' },
        h5: { fontFamily: '"Lora", serif', fontWeight: 600, fontSize: '1.5rem' },
        h6: { fontWeight: 700 },
        subtitle1: { fontSize: '1.1rem', lineHeight: 1.7, fontWeight: 400 },
    },
    components: {
        MuiButton: { styleOverrides: { root: { borderRadius: 50, textTransform: 'none', fontWeight: 700, padding: '10px 25px' } } },
        MuiChip: { styleOverrides: { root: { borderRadius: 8, fontWeight: 700 } } }
    },
});


export default function StudentRegistration() {
    return (
        <ThemeProvider theme={elegantTheme}>
            <CssBaseline />
            <Header />
            <main>
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 4,
                    maxWidth: 1100,
                    mx: 'auto',
                    my: 6,
                    px: { xs: 2, md: 0 },
                }}>
                    <Box sx={{ flex: 2.5, minWidth: 0 }}>
                        <ContactForm />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <ContactInfo />
                    </Box>
                </Box>
            </main>
            <Footer />
        </ThemeProvider>
    );
}
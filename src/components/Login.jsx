import '../App.css'
import {React, useState} from 'react'
import { Box, Typography, Alert, Fade, Grid, Paper, Stack } from '@mui/material'
import MyTextField from './forms/MyTextField'
import MyPassField from './forms/MyPassField'
import MyButton from './forms/MyButton'
import {Link} from 'react-router-dom'
import {useForm} from 'react-hook-form'
import AxiosInstance from './AxiosInstance'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.svg'
import backgroundImage from '../assets/background-login.jpg'
const Login = () => {
    const navigate = useNavigate()
    
    const { handleSubmit, control } = useForm({
        defaultValues: {
            email: '', 
            password: ''
        }
    });

    const [showMessage, setShowMessage] = useState(false)
    const [messageText, setMessageText] = useState('')
    const [messageType, setMessageType] = useState('error')
    const [loading, setLoading] = useState(false)

    const handleLogin = async (data) => {
        setLoading(true)
        setShowMessage(false)
        console.log('🔐 Attempting login with:', data.email)
        
        try {
            const response = await AxiosInstance.post('login/', {
                email: data.email, 
                password: data.password,
            })
            
            console.log('✅ Login successful')
            console.log('✅ User data:', response.data.user)
            console.log('✅ Token received:', response.data.token ? 'YES' : 'NO')
            
            // Stocker le token et les données utilisateur
            localStorage.setItem('Token', response.data.token)
            localStorage.setItem('User', JSON.stringify(response.data.user))
            
            // Vérifier ce qui est stocké
            console.log('💾 Stored Token:', localStorage.getItem('Token'))
            console.log('💾 Stored User:', localStorage.getItem('User'))
            
            // ✅ REDIRECTION VERS DASHBOARD
            navigate('/dashboard')
            
        } catch (error) {
            console.error('❌ Login error:', error)
            
            let errorMessage = 'Login failed. Please try again.'
            
            if (error.response) {
                console.error('📡 Server response:', error.response.status)
                console.error('📡 Server data:', error.response.data)
                
                if (error.response.status === 401) {
                    errorMessage = 'Invalid email or password'
                } else if (error.response.data && error.response.data.error) {
                    errorMessage = error.response.data.error
                } else {
                    errorMessage = 'Login failed. Please try again.'
                }
            } else if (error.request) {
                console.error('🌐 No response received')
                errorMessage = 'Cannot connect to server. Please check your connection.'
            } else {
                console.error('⚙️ Request error:', error.message)
                errorMessage = 'Login failed. Please try again.'
            }
            
            setMessageText(errorMessage)
            setMessageType('error')
            setShowMessage(true)
            
            // Auto-hide message after 5 seconds
            setTimeout(() => {
                setShowMessage(false)
            }, 5000)
        } finally {
            setLoading(false)
        }
    }

    return(
        <Box 
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                }
            }}
        >
            {/* Message Alert */}
            <Fade in={showMessage}>
                <Box sx={{ 
                    position: 'fixed',
                    top: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1000,
                    width: '90%',
                    maxWidth: 400
                }}>
                    <Alert 
                        severity={messageType}
                        onClose={() => setShowMessage(false)}
                        sx={{
                            borderRadius: 2,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                            backgroundColor: 'white',
                            fontWeight: 500,
                        }}
                    >
                        {messageText}
                    </Alert>
                </Box>
            </Fade>
            
            {/* Conteneur principal avec deux colonnes */}
            <Grid 
                container 
                sx={{
                    maxWidth: 1200,
                    width: '90%',
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                    height: { xs: 'auto', md: 650 },
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                {/* Colonne gauche - Image */}
                <Grid 
                    item 
                    xs={12} 
                    md={6}
                    sx={{
                        display: { xs: 'none', md: 'flex' },
                        backgroundImage: `url(${backgroundImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(135deg, rgba(8, 35, 116, 0.8) 0%, rgba(91, 8, 116, 0.6) 100%)',
                        }
                    }}
                >
                    {/* Contenu superposé sur l'image */}
                    <Box
                        sx={{
                            position: 'relative',
                            zIndex: 2,
                            padding: 6,
                            color: 'white',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                        }}
                    >
                        <Typography 
                            variant="h3" 
                            sx={{ 
                                fontWeight: 700,
                                mb: 3,
                                fontSize: { md: '2.5rem', lg: '3rem' }
                            }}
                        >
                            Welcome Back
                        </Typography>
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                mb: 4,
                                opacity: 0.9,
                                fontWeight: 300,
                                lineHeight: 1.6
                            }}
                        >
                            Sign in to access your dashboard and continue your journey with us.
                        </Typography>
                        <Box sx={{ mt: 4 }}>
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    opacity: 0.8,
                                    fontStyle: 'italic'
                                }}
                            >
                                "The only way to do great work is to love what you do."
                            </Typography>
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    opacity: 0.6,
                                    display: 'block',
                                    mt: 1
                                }}
                            >
                                - Steve Jobs
                            </Typography>
                        </Box>
                    </Box>
                </Grid>

                {/* Colonne droite - Formulaire */}
                <Grid 
                    item 
                    xs={12} 
                    md={6}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: { xs: 4, md: 6 }
                    }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            width: '100%',
                            maxWidth: 450,
                            background: 'transparent',
                            padding: 0
                        }}
                    >
                        <form onSubmit={handleSubmit(handleLogin)}>
                            <Box 
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    mb: 4
                                }}
                            >
                                {/* Logo */}
                                <Box sx={{ 
                                    mb: 3,
                                    padding: '16px',
                                    backgroundColor: 'white',
                                    borderRadius: '50%',
                                    boxShadow: '0 8px 30px rgba(8, 35, 116, 0.15)',
                                    width: '100px',
                                    height: '100px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid rgba(8, 35, 116, 0.1)'
                                }}>
                                    <img 
                                        src={logo} 
                                        alt="Logo" 
                                        style={{ 
                                            width: '70px', 
                                            height: '70px',
                                            objectFit: 'contain'
                                        }}
                                    />
                                </Box>
                                
                                <Typography 
                                    variant="h4" 
                                    sx={{ 
                                        textAlign: 'center', 
                                        mb: 1,
                                        fontWeight: 700,
                                        background: 'linear-gradient(90deg, rgba(8, 35, 116, 1) 45%, rgba(85, 111, 189, 1) 67%)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}
                                >
                                    Welcome Back
                                </Typography>
                                <Typography variant="body1" sx={{ 
                                    color: '#666', 
                                    textAlign: 'center',
                                    mb: 4,
                                    opacity: 0.8
                                }}>
                                    Sign in to access your dashboard
                                </Typography>
                            </Box>

                            {/* Email Field */}
                            <Box sx={{ mb: 3 }}>
                                <MyTextField
                                    label="Email Address"
                                    name="email"
                                    control={control}
                                    rules={{ 
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address"
                                        }
                                    }}
                                    fullWidth
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '12px',
                                            backgroundColor: 'white',
                                            '&:hover fieldset': {
                                                borderColor: 'rgba(8, 35, 116, 0.5)',
                                                borderWidth: '2px'
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'rgba(8, 35, 116, 1)',
                                                borderWidth: '2px'
                                            }
                                        },
                                        '& .MuiInputLabel-root': {
                                            color: '#666',
                                            '&.Mui-focused': {
                                                color: 'rgba(8, 35, 116, 1)'
                                            }
                                        }
                                    }}
                                />
                            </Box>

                            {/* Password Field */}
                            <Box sx={{ mb: 3 }}>
                                <MyPassField
                                    label="Password"
                                    name="password"
                                    control={control}
                                    rules={{ 
                                        required: "Password is required",
                                        minLength: {
                                            value: 6,
                                            message: "Password must be at least 6 characters"
                                        }
                                    }}
                                    fullWidth
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '12px',
                                            backgroundColor: 'white',
                                            '&:hover fieldset': {
                                                borderColor: 'rgba(8, 35, 116, 0.5)',
                                                borderWidth: '2px'
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'rgba(8, 35, 116, 1)',
                                                borderWidth: '2px'
                                            }
                                        },
                                        '& .MuiInputLabel-root': {
                                            color: '#666',
                                            '&.Mui-focused': {
                                                color: 'rgba(8, 35, 116, 1)'
                                            }
                                        }
                                    }}
                                />
                            </Box>

                            {/* Lien "Forgot Password" */}
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'flex-end',
                                mb: 4
                            }}>
                                <Link 
                                    to="/request/password_reset" 
                                    style={{
                                        color: '#666',
                                        textDecoration: 'none',
                                        fontSize: '0.9rem',
                                        fontWeight: '500',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            color: 'rgba(8, 35, 116, 1)',
                                            textDecoration: 'underline'
                                        }
                                    }}
                                >
                                    Forgot your password?
                                </Link>
                            </Box>

                            {/* Login Button */}
                            <Box sx={{ mb: 3 }}>
                                <MyButton 
                                    label={loading ? "Logging in..." : "Login to Dashboard"}
                                    type="submit"
                                    disabled={loading}
                                    loading={loading}
                                    fullWidth
                                    sx={{
                                        height: '56px',
                                        backgroundColor: '#16244d !important',
                                        color: 'white !important',
                                        fontWeight: '600 !important',
                                        fontSize: '16px !important',
                                        textTransform: 'none',
                                        borderRadius: '12px !important',
                                        boxShadow: '0 8px 25px rgba(22, 36, 77, 0.3) !important',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important',
                                        '&:hover': {
                                            backgroundColor: '#1d2f6b !important',
                                            boxShadow: '0 12px 30px rgba(22, 36, 77, 0.4) !important',
                                            transform: 'translateY(-3px) !important'
                                        },
                                        '&:active': {
                                            transform: 'translateY(0) !important'
                                        },
                                        '&:disabled': {
                                            backgroundColor: '#e0e0e0 !important',
                                            color: '#9e9e9e !important',
                                            boxShadow: 'none !important',
                                            transform: 'none !important'
                                        }
                                    }}
                                />
                            </Box>

                            {/* Lien "Register" */}
                            <Box sx={{ 
                                textAlign: 'center',
                                mb: 4
                            }}>
                                <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                                    Don't have an account?
                                </Typography>
                                <Link 
                                    to="/register" 
                                    style={{
                                        color: 'rgba(8, 35, 116, 1)',
                                        textDecoration: 'none',
                                        fontWeight: '600',
                                        fontSize: '1rem',
                                        transition: 'all 0.3s ease',
                                        padding: '8px 24px',
                                        borderRadius: '25px',
                                        backgroundColor: 'rgba(8, 35, 116, 0.05)',
                                        display: 'inline-block',
                                        '&:hover': {
                                            color: 'rgba(85, 111, 189, 1)',
                                            backgroundColor: 'rgba(8, 35, 116, 0.1)',
                                            textDecoration: 'none',
                                            transform: 'translateY(-1px)'
                                        }
                                    }}
                                >
                                    Create account
                                </Link>
                            </Box>

                            {/* Séparateur */}
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                mb: 4,
                                opacity: 0.5
                            }}>
                                <Box sx={{ flex: 1, height: '1px', backgroundColor: '#ddd' }} />
                                <Typography variant="body2" sx={{ mx: 2, color: '#666' }}>
                                    OR
                                </Typography>
                                <Box sx={{ flex: 1, height: '1px', backgroundColor: '#ddd' }} />
                            </Box>

                            {/* Liens supplémentaires */}
                            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 4 }}>
                                <Link 
                                    to="/privacy" 
                                    style={{
                                        color: '#666',
                                        textDecoration: 'none',
                                        fontSize: '0.8rem',
                                        '&:hover': {
                                            color: 'rgba(8, 35, 116, 1)',
                                            textDecoration: 'underline'
                                        }
                                    }}
                                >
                                    Privacy Policy
                                </Link>
                                <Typography variant="caption" sx={{ color: '#666', opacity: 0.5 }}>•</Typography>
                                <Link 
                                    to="/terms" 
                                    style={{
                                        color: '#666',
                                        textDecoration: 'none',
                                        fontSize: '0.8rem',
                                        '&:hover': {
                                            color: 'rgba(8, 35, 116, 1)',
                                            textDecoration: 'underline'
                                        }
                                    }}
                                >
                                    Terms of Service
                                </Link>
                                <Typography variant="caption" sx={{ color: '#666', opacity: 0.5 }}>•</Typography>
                                <Link 
                                    to="/contact" 
                                    style={{
                                        color: '#666',
                                        textDecoration: 'none',
                                        fontSize: '0.8rem',
                                        '&:hover': {
                                            color: 'rgba(8, 35, 116, 1)',
                                            textDecoration: 'underline'
                                        }
                                    }}
                                >
                                    Contact Support
                                </Link>
                            </Stack>

                            {/* Footer */}
                            <Box sx={{ 
                                pt: 3,
                                borderTop: '1px solid rgba(0,0,0,0.1)',
                                textAlign: 'center'
                            }}>
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        color: '#666',
                                        opacity: 0.6,
                                        fontSize: '0.8rem',
                                        letterSpacing: '0.5px'
                                    }}
                                >
                                    Secure authentication system • © {new Date().getFullYear()}
                                </Typography>
                            </Box>
                        </form>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    )
}

export default Login
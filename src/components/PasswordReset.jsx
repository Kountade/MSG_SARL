import '../App.css'
import { React, useState, useEffect } from 'react'
import { 
  Box, 
  Typography, 
  Container,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment
} from '@mui/material'
import { 
  Visibility, 
  VisibilityOff,
  CheckCircle,
  LockReset
} from '@mui/icons-material'
import MyTextField from './forms/MyTextField'
import MyButton from './forms/MyButton'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import AxiosInstance from './AxiosInstance'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Schéma de validation avec Zod
const passwordResetSchema = z.object({
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial'),
  password2: z.string()
}).refine((data) => data.password === data.password2, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['password2'],
})

const PasswordReset = () => {
  const navigate = useNavigate()
  const { token } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isValidatingToken, setIsValidatingToken] = useState(true)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState({
    password: false,
    password2: false
  })

  const { 
    handleSubmit, 
    control,
    formState: { errors },
    watch,
    reset
  } = useForm({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      password: '',
      password2: '',
    }
  })

  const password = watch('password')

  // Vérifier la validité du token au chargement
  useEffect(() => {
    const validateToken = async () => {
      try {
        // Appel API pour vérifier le token
        await AxiosInstance.post('api/password_reset/validate_token/', {
          token: token,
        })
        setIsValidatingToken(false)
      } catch (error) {
        console.error('Token validation error:', error)
        setMessage({
          text: 'Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.',
          type: 'error'
        })
        setIsValidatingToken(false)
        
        // Redirection après 5 secondes
        setTimeout(() => {
          navigate('/password-reset-request')
        }, 5000)
      }
    }

    validateToken()
  }, [token, navigate])

  const handleClickShowPassword = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field]
    })
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    setMessage({ text: '', type: '' })

    try {
      await AxiosInstance.post('api/password_reset/confirm/', {
        password: data.password,
        token: token,
      })

      setIsSubmitted(true)
      setMessage({
        text: 'Votre mot de passe a été réinitialisé avec succès !',
        type: 'success'
      })
      
      // Redirection après 3 secondes
      setTimeout(() => {
        navigate('/login')
      }, 3000)

    } catch (error) {
      console.error('Password reset error:', error)
      
      let errorMessage = 'Une erreur est survenue. Veuillez réessayer.'
      
      if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Le lien a expiré ou est invalide.'
      } else if (error.response?.status === 404) {
        errorMessage = 'Lien de réinitialisation non trouvé.'
      }

      setMessage({
        text: errorMessage,
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetForm = () => {
    reset()
    setMessage({ text: '', type: '' })
  }

  const passwordStrength = (pass) => {
    let strength = 0
    if (pass.length >= 8) strength++
    if (/[A-Z]/.test(pass)) strength++
    if (/[a-z]/.test(pass)) strength++
    if (/[0-9]/.test(pass)) strength++
    if (/[^A-Za-z0-9]/.test(pass)) strength++
    return strength
  }

  const getStrengthColor = (strength) => {
    if (strength === 0) return '#f44336'
    if (strength <= 2) return '#ff9800'
    if (strength <= 4) return '#ffeb3b'
    return '#4caf50'
  }

  const getStrengthText = (strength) => {
    if (strength === 0) return 'Très faible'
    if (strength <= 2) return 'Faible'
    if (strength <= 4) return 'Moyen'
    return 'Fort'
  }

  if (isValidatingToken) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={6}
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 2,
              background: 'white',
            }}
          >
            <CircularProgress size={60} sx={{ mb: 3, color: '#667eea' }} />
            <Typography variant="h6" sx={{ color: '#333' }}>
              Vérification du lien...
            </Typography>
          </Paper>
        </Container>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: 2,
            background: 'white',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            }
          }}
        >
          <Box
            sx={{
              textAlign: 'center',
              mb: 4
            }}
          >
            <LockReset 
              sx={{ 
                fontSize: 60, 
                color: '#667eea',
                mb: 2
              }} 
            />
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                color: '#333',
                mb: 1
              }}
            >
              Nouveau mot de passe
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              Créez un nouveau mot de passe sécurisé pour votre compte
            </Typography>
          </Box>

          {message.text && (
            <Alert 
              severity={message.type}
              sx={{ mb: 3 }}
              onClose={() => setMessage({ text: '', type: '' })}
              icon={message.type === 'success' ? <CheckCircle /> : null}
            >
              {message.text}
            </Alert>
          )}

          {!isSubmitted ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ mb: 3 }}>
                <MyTextField
                  label="Nouveau mot de passe"
                  name="password"
                  control={control}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  fullWidth
                  disabled={isLoading}
                  type={showPassword.password ? 'text' : 'password'}
                  autoComplete="new-password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        🔒
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleClickShowPassword('password')}
                          edge="end"
                        >
                          {showPassword.password ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                {password && (
                  <Box sx={{ mt: 1, ml: 1 }}>
                    <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                      Force du mot de passe: 
                      <Box component="span" sx={{ 
                        ml: 1, 
                        fontWeight: 'bold',
                        color: getStrengthColor(passwordStrength(password))
                      }}>
                        {getStrengthText(passwordStrength(password))}
                      </Box>
                    </Typography>
                    <Box sx={{ 
                      height: 4, 
                      bgcolor: '#e0e0e0', 
                      borderRadius: 2,
                      overflow: 'hidden'
                    }}>
                      <Box sx={{ 
                        width: `${(passwordStrength(password) / 5) * 100}%`,
                        height: '100%',
                        bgcolor: getStrengthColor(passwordStrength(password)),
                        transition: 'all 0.3s ease'
                      }} />
                    </Box>
                  </Box>
                )}
              </Box>

              <Box sx={{ mb: 4 }}>
                <MyTextField
                  label="Confirmer le mot de passe"
                  name="password2"
                  control={control}
                  error={!!errors.password2}
                  helperText={errors.password2?.message}
                  fullWidth
                  disabled={isLoading}
                  type={showPassword.password2 ? 'text' : 'password'}
                  autoComplete="new-password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        🔐
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleClickShowPassword('password2')}
                          edge="end"
                        >
                          {showPassword.password2 ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <MyButton
                  label={
                    isLoading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} color="inherit" />
                        Traitement...
                      </Box>
                    ) : "Réinitialiser"
                  }
                  type="submit"
                  fullWidth
                  disabled={isLoading}
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #5a6fd8 0%, #6a4290 100%)'
                    }
                  }}
                />
                
                <MyButton
                  label="Effacer"
                  onClick={handleResetForm}
                  variant="outlined"
                  disabled={isLoading}
                  sx={{
                    py: 1.5,
                    borderColor: '#dc3545',
                    color: '#dc3545',
                    '&:hover': {
                      borderColor: '#c82333',
                      background: 'rgba(220, 53, 69, 0.04)'
                    }
                  }}
                />
              </Box>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  <Box 
                    component="span" 
                    sx={{ 
                      color: '#667eea',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      '&:hover': { color: '#764ba2' }
                    }}
                    onClick={() => navigate('/login')}
                  >
                    Retour à la connexion
                  </Box>
                </Typography>
              </Box>
            </form>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: '#e8f5e9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3
                }}
              >
                <CheckCircle sx={{ fontSize: 60, color: '#4caf50' }} />
              </Box>

              <Typography variant="h5" sx={{ mb: 2, color: '#2e7d32' }}>
                Mot de passe réinitialisé !
              </Typography>

              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ mb: 4 }}
              >
                Vous allez être redirigé vers la page de connexion dans quelques secondes.
              </Typography>

              <CircularProgress 
                size={40} 
                sx={{ 
                  color: '#4caf50',
                  mb: 3 
                }} 
              />

              <MyButton
                label="Aller à la connexion"
                onClick={() => navigate('/login')}
                sx={{
                  px: 4,
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #5a6fd8 0%, #6a4290 100%)'
                  }
                }}
              />
            </Box>
          )}

          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e0e0e0' }}>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ textAlign: 'center', display: 'block' }}
            >
              Conseil : Utilisez un mot de passe unique que vous n'utilisez nulle part ailleurs.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default PasswordReset
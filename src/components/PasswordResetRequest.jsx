import '../App.css'
import { React, useState } from 'react'
import { 
  Box, 
  Typography, 
  Container,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material'
import MyTextField from './forms/MyTextField'
import MyButton from './forms/MyButton'
import { useForm } from 'react-hook-form'
import AxiosInstance from './AxiosInstance'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Schéma de validation avec Zod
const passwordResetSchema = z.object({
  email: z.string()
    .email('Veuillez entrer une adresse email valide')
    .min(1, 'L\'email est requis'),
})

const PasswordResetRequest = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const { 
    handleSubmit, 
    control,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      email: '',
    }
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    setMessage({ text: '', type: '' })

    try {
      await AxiosInstance.post('api/password_reset/', {
        email: data.email,
      })

      setIsSubmitted(true)
      setMessage({
        text: 'Si votre adresse email existe dans notre système, vous recevrez bientôt des instructions pour réinitialiser votre mot de passe.',
        type: 'success'
      })
    } catch (error) {
      console.error('Password reset request error:', error)
      
      // Ne pas révéler si l'email existe ou non pour des raisons de sécurité
      setMessage({
        text: 'Une erreur est survenue. Veuillez réessayer ultérieurement.',
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setIsSubmitted(false)
    setMessage({ text: '', type: '' })
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
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                color: '#333',
                mb: 1
              }}
            >
              Réinitialisation du mot de passe
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              Entrez votre adresse email pour recevoir les instructions de réinitialisation
            </Typography>
          </Box>

          {message.text && (
            <Alert 
              severity={message.type}
              sx={{ mb: 3 }}
              onClose={() => setMessage({ text: '', type: '' })}
            >
              {message.text}
            </Alert>
          )}

          {!isSubmitted ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ mb: 3 }}>
                <MyTextField
                  label="Adresse email"
                  name="email"
                  control={control}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  fullWidth
                  disabled={isLoading}
                  autoComplete="email"
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ mr: 1, color: 'text.secondary' }}>
                        ✉️
                      </Box>
                    ),
                  }}
                />
              </Box>

              <MyButton
                label={
                  isLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      Envoi en cours...
                    </Box>
                  ) : "Envoyer les instructions"
                }
                type="submit"
                fullWidth
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                }}
              />

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
                    onClick={() => window.history.back()}
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
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: '#e8f5e9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3
                }}
              >
                <Typography
                  variant="h3"
                  sx={{ color: '#4caf50' }}
                >
                  ✓
                </Typography>
              </Box>

              <Typography variant="h6" sx={{ mb: 2, color: '#2e7d32' }}>
                Email envoyé !
              </Typography>

              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ mb: 4 }}
              >
                Consultez votre boîte de réception et suivez les instructions pour réinitialiser votre mot de passe.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <MyButton
                  label="Réessayer"
                  onClick={handleReset}
                  variant="outlined"
                  sx={{
                    px: 4,
                    borderColor: '#667eea',
                    color: '#667eea',
                    '&:hover': {
                      borderColor: '#764ba2',
                      background: 'rgba(102, 126, 234, 0.04)'
                    }
                  }}
                />
                <MyButton
                  label="Retour"
                  onClick={() => window.history.back()}
                  sx={{
                    px: 4,
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #5a6fd8 0%, #6a4290 100%)'
                    }
                  }}
                />
              </Box>
            </Box>
          )}

          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e0e0e0' }}>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ textAlign: 'center', display: 'block' }}
            >
              Si vous ne recevez pas l'email, vérifiez votre dossier de spam ou contactez notre support.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default PasswordResetRequest
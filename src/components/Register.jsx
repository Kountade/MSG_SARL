// src/components/Register.jsx
import '../App.css'
import {React, useState} from 'react'
import { Box, MenuItem } from '@mui/material'
import MyTextField from './forms/MyTextField'
import MyPassField from './forms/MyPassField'
import MyButton from './forms/MyButton'
import {Link} from 'react-router-dom'
import {useForm} from 'react-hook-form'
import AxiosInstance from './AxiosInstance'
import { useNavigate } from 'react-router-dom'
import {yupResolver} from "@hookform/resolvers/yup"
import * as yup from "yup"
import MyMessage from './Message'

const Register = () =>{
    const navigate = useNavigate()

    const [showMessage, setShowMessage] = useState(false)
    const [messageText, setMessageText] = useState('')
    const [messageColor, setMessageColor] = useState('#EC5A76')
    const [isLoading, setIsLoading] = useState(false)

    const schema = yup
    .object({
        email: yup.string().email('Field expects an email address').required('Email is a required field'),
        password: yup.string()
                    .required('Password is a required field')
                    .min(8,'Password must be at least 8 characters')
                    .matches(/[A-Z]/,'Password must contain at least one uppercase letter')
                    .matches(/[a-z]/,'Password must contain at least one lower case letter')
                    .matches(/[0-9]/,'Password must contain at least one number')
                    .matches(/[!@#$%^&*(),.?":;{}|<>+]/, 'Password must contain at least one special character'),
        password2: yup.string().required('Password confirmation is a required field')
                     .oneOf([yup.ref('password'),null], 'Passwords must match'),
        role: yup.string().required('Role is required').oneOf(['admin', 'vendeur'], 'Invalid role selected')

    })  

    const {handleSubmit, control} = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            role: 'vendeur'
        }
    })

    const submission = (data) => {
        console.log('📝 Registration data:', data)
        setIsLoading(true)
        setShowMessage(false)

        // Retirer password2 car l'API ne l'attend pas
        const { password2, ...submitData } = data;
        
        // ✅ CORRECTION : Utiliser register/ sans api/auth/
        AxiosInstance.post(`register/`, submitData)
        .then((response) => {
            console.log('✅ Registration successful:', response.data)
            setMessageText('Registration successful! Redirecting to login...')
            setMessageColor('#4CAF50')
            setShowMessage(true)
            setTimeout(() => {
                navigate('/')
            }, 2000)
        })
        .catch((error) => {
            console.error('❌ Registration error:', error)
            console.error('Error response:', error.response)
            
            let errorMessage = 'Registration failed. Please try again.'
            
            if (error.response && error.response.data) {
                // Gérer les erreurs spécifiques du backend
                if (error.response.data.email) {
                    errorMessage = `Email: ${error.response.data.email[0]}`
                } else if (error.response.data.role) {
                    errorMessage = `Role: ${error.response.data.role[0]}`
                } else if (error.response.data.password) {
                    errorMessage = `Password: ${error.response.data.password[0]}`
                } else if (error.response.data.detail) {
                    errorMessage = error.response.data.detail
                }
            } else if (error.request) {
                errorMessage = 'Cannot connect to server. Please check your connection.'
            }
            
            setMessageText(errorMessage)
            setMessageColor('#EC5A76')
            setShowMessage(true)
        })
        .finally(() => {
            setIsLoading(false)
        })
    }

    return(
        <div className={"myBackground"}> 
            {showMessage && <MyMessage text={messageText} color={messageColor}/>}

            <form onSubmit={handleSubmit(submission)}>
               
            <Box className={"whiteBox"}>

                <Box className={"itemBox"}>
                    <Box className={"title"}> Use registration </Box>
                </Box>

                <Box className={"itemBox"}>
                    <MyTextField
                    label={"Email"}
                    name={"email"}
                    control={control}
                    type="email"
                    disabled={isLoading}
                    />
                </Box>

                <Box className={"itemBox"}>
                    <MyPassField
                    label={"Password"}
                    name={"password"}
                    control={control}
                    disabled={isLoading}
                    />
                </Box>

                <Box className={"itemBox"}>
                    <MyPassField
                    label={"Confirm password"}
                    name={"password2"}
                    control={control}
                    disabled={isLoading}
                    />
                </Box>

                <Box className={"itemBox"}>
                    <MyTextField
                    select
                    label={"Role"}
                    name={"role"}
                    control={control}
                    disabled={isLoading}
                    >
                        <MenuItem value="vendeur">Vendeur</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                    </MyTextField>
                </Box>

                <Box className={"itemBox"}>
                    <MyButton 
                        type={"submit"}
                        label={isLoading ? "Registering..." : "Register"}
                        disabled={isLoading}
                    />
                </Box>

                <Box className={"itemBox"}>
                    <Link to="/"> Already registered? Please login! </Link>
                </Box>

            </Box>

            </form> 
            
        </div>
    )
}

export default Register
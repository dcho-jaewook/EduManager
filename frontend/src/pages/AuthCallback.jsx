import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function AuthCallback() {
    const navigate = useNavigate()
    const [error, setError] = useState(null)

    useEffect(() => {
        // First, try to get the current session
        supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
            if (sessionError) {
                console.error('Session error:', sessionError)
                setError(sessionError.message)
                return
            }
            
            if (session) {
                console.log('Session found, redirecting to home...')
                navigate('/')
                return
            }
        })

        // Then set up the auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event, session ? 'Session exists' : 'No session')
            
            if (event === 'SIGNED_IN') {
                console.log('Sign in successful, redirecting...')
                navigate('/')
            } else if (event === 'SIGNED_OUT') {
                console.log('Signed out')
            } else if (event === 'USER_UPDATED') {
                console.log('User updated')
            } else if (event === 'PASSWORD_RECOVERY') {
                console.log('Password recovery')
            } else if (event === 'TOKEN_REFRESHED') {
                console.log('Token refreshed')
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [navigate])

    if (error) {
        return (
            <div className="container">
                <div className="error">Error: {error}</div>
            </div>
        )
    }

    return (
        <div className="container">
            <div className="loading">Completing sign in...</div>
        </div>
    )
}

export default AuthCallback 
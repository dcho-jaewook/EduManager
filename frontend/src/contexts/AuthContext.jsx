import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserRole = async (userId) => {
            try {
                // console.log('Fetching role for user:', userId);
                const { data, error } = await supabase
                    .rpc('get_user_role', { user_id: userId });
                
                if (error) {
                    console.error('Error fetching user role:', {
                        message: error.message,
                        details: error.details,
                        hint: error.hint,
                        code: error.code
                    });
                    
                    // Handle specific error cases
                    if (error.code === 'PGRST116') {
                        console.error('Profile not found for user:', userId);
                        // You might want to create a profile here if it doesn't exist
                    } else if (error.code === '500') {
                        console.error('Server error when fetching profile. This might indicate a database or permission issue.');
                    }
                    
                    setUserRole(null);
                    return;
                }
                
                if (data !== null) {
                    // console.log('Successfully fetched user role:', data);
                    setUserRole(data);
                } else {
                    // console.log('No role data found for user:', userId);
                    setUserRole(null);
                }
            } catch (err) {
                console.error('Unexpected error in fetchUserRole:', err);
                setUserRole(null);
            }
        };

        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserRole(session.user.id);
            }
            setLoading(false)
        })

        // Listen for changes on auth state (sign in, sign out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                // fetchUserRole(session.user.id);
            } else {
                setUserRole(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [])

    const signInWithGoogle = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    scopes: 'email profile https://www.googleapis.com/auth/calendar'
                }
            })
            if (error) throw error
        } catch (error) {
            console.error('Error signing in with Google:', error.message)
            throw error
        }
    }

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error
        } catch (error) {
            console.error('Error signing out:', error.message)
            throw error
        }
    }

    const value = {
        user,
        loading,
        userRole,
        signInWithGoogle,
        signOut
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext)
} 
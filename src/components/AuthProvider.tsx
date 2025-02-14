"use client"

import { auth } from '@/firebaseconfig';
import { onAuthStateChanged, User } from 'firebase/auth'
import React, { createContext, useContext, useEffect, useState } from 'react'

type AuthContextType = {
    user: User | null;
}
const AuthContext = createContext<AuthContextType>({user: null});
export default function AuthProvider({children} : {children:React.ReactNode}) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user || null)
        })
        return () => unsubscribe()
    },[auth])

  return (
    <AuthContext.Provider value={{user}}>{children}</AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext);
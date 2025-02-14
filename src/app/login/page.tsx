import OtpLogin from '@/components/OtpLogin'
import React from 'react'

export default function LoginPage() {
  return (
    <div className='flex flex-col items-center'>
        <h1 className='font-bold text-center mb-5'>
            Phone Number Authentication
        </h1>    
        <OtpLogin/>
    </div>
  )
}

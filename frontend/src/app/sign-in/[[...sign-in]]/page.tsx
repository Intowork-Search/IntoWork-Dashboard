'use client';

import { SignIn } from '@/hooks/useNextAuth';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenue sur INTOWORK
          </h1>
          <p className="text-gray-600">
            Connectez-vous pour accéder à votre compte
          </p>
        </div>
        
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
              card: 'bg-white shadow-lg border border-gray-200',
              headerTitle: 'text-xl font-semibold text-gray-900',
              socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50 text-gray-700',
              socialButtonsBlockButtonText: 'font-medium',
              dividerLine: 'bg-gray-200',
              dividerText: 'text-gray-500',
              formFieldInput: 'border border-gray-300 rounded-md',
              footerActionLink: 'text-blue-600 hover:text-blue-700'
            }
          }}
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  );
}

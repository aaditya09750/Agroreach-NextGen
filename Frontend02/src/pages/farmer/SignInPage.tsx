import React from 'react';
import SignInBanner from '../../components/sections/SignInBanner';
import SignInForm from '../../components/sections/SignInForm';

const SignInPage: React.FC = () => {
  return (
    <div className="bg-white">
      <main className="bg-white">
        <SignInBanner />
        <div className="bg-white py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-[120px] flex justify-center">
            <SignInForm />
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignInPage;

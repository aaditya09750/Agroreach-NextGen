import React from 'react';
import ContactBanner from '../../components/sections/ContactBanner';
import ContactContent from '../../components/sections/ContactContent';
import MapSection from '../../components/sections/MapSection';

const ContactPage: React.FC = () => {
  return (
    <div className="bg-white">
      <main className="bg-white">
        <ContactBanner />
        <div className="bg-white py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-[120px] space-y-6">
            <ContactContent />
            <MapSection />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;

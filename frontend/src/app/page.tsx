'use client';
import Image from 'next/image';
import React, { useState } from 'react';
import ImageInput from './components/ImageInput';
import CurrentTime from './components/CurrentTime';

const Home: React.FC = () => {
  const [message, setMessage] = useState<string>('');

  const handleDataFromChild = (data: string) => {
    setMessage(data.toLocaleString()); 
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main content */}
      <header className="bg-gray-800 text-white text-center py-8">
        <h1 className="text-4xl font-bold">AI JUNIOR TEST</h1>
        <p className="text-lg mt-2">People detection</p>
      </header>

      {/* Page content */}
      <main className="flex-grow bg-gray-100 text-center py-8">
        <h3 className="text-lg text-gray-700">
          Hello, My name is Tran Ngoc Minh Song, welcome to my NextJS frontend app. You can test the app with this button below:
        </h3>
        <CurrentTime onDataChange={handleDataFromChild} />
        <ImageInput message={message} />
        
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-4">
        <Image
          src="/img/contact.png"
          alt="Logo"
          className="inline-block"
        />
        <p className="text-sm inline-block ml-2">
          <p>Name: Tran Ngoc Minh Song</p>
          <p>Mail: songtran91105712@gmail.com</p>
          <p>SDT: 0389543650</p>
        </p>
      </footer>
    </div>
  );
};

export default Home;

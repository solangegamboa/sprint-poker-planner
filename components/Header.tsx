
import React from 'react';
import { APP_TITLE } from '../constants';

const Header: React.FC = () => {
  return (
    <header className="bg-primary shadow-md">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold text-white">{APP_TITLE}</h1>
      </div>
    </header>
  );
};

export default Header;
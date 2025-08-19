
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <header className={`py-8 transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
      <h1 className="font-bold text-white text-3xl md:text-4xl tracking-widest text-center mb-6" style={{ fontFamily: 'Arial', letterSpacing: '0.2em' }}>
        ENGAGE ENGINE
      </h1>
      
      <nav className="flex justify-center">
        <Link 
          to="/dashboard" 
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
        >
          Dashboard
        </Link>
      </nav>
    </header>
  );
};

export default Header;

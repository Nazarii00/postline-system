import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion'; // 1. Імпортуємо motion

const Navbar = () => {
  const location = useLocation();

  const links = [
    { name: 'Послуги', path: '/' }, 
    { name: 'Відстеження', path: '/tracking' }, 
    { name: 'Тарифи', path: '/tariffs' },
    { name: 'Відділення', path: '/branches' },
  ];

  return (
    <nav className="flex-1 ml-12 h-full">
      <ul className="flex gap-8 h-full">
        {links.map((link) => {
          const isActive = location.pathname === link.path;

          return (
            <li 
              key={link.name}
              className={`flex items-center h-full relative transition-colors duration-300
                ${isActive ? 'text-white' : 'text-gray-300 hover:text-white'}
              `}
            >
              {/* Додав z-10, щоб текст завжди був поверх ліній (про всяк випадок) */}
              <Link to={link.path} className="font-medium px-1 cursor-pointer z-10">
                {link.name}
              </Link>
              
              {/* 2. Замінюємо звичайний div на motion.div */}
              {isActive && (
                <motion.div 
                  layoutId="navbar-indicator" // Секретний інгредієнт!
                  className="absolute bottom-0 left-0 w-full h-[4px] bg-[var(--color-gold)]"
                  // Налаштування "пружності" анімації
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 30 
                  }}
                />
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Navbar;
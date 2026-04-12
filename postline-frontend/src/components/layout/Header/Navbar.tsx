import { Link } from 'react-router-dom'; 

const Navbar = () => {

  const links = [
    { name: 'Послуги', path: '/', active: true }, 
    { name: 'Відстеження', path: '/tracking', active: false }, 
    { name: 'Тарифи', path: '/tariffs', active: false },
    { name: 'Відділення', path: '/branches', active: false },
  ];

  return (
    <nav className="flex-1 ml-12 h-full">
      <ul className="flex gap-8 h-full">
        {links.map((link) => (
          <li 
            key={link.name}
            className={`flex items-center h-full relative transition-colors duration-300
              ${link.active ? 'text-white' : 'text-gray-300 hover:text-white'}
            `}
          >
            <Link to={link.path} className="font-medium px-1 cursor-pointer">
              {link.name}
            </Link>
            
            {link.active && (
              <div className="absolute bottom-0 left-0 w-full h-[4px] bg-[var(--color-gold)]"></div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
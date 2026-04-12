import { Link } from 'react-router-dom';

const AuuthButtons = () => {
    return ( 
        <div className="flex items-center gap-4">
            {/* Кнопка Увійти — тепер Link */}
            <Link 
                to="/auth" 
                state={{ mode: 'login' }}
                className="px-6 py-2 border border-white/50 rounded-lg hover:border-white hover:bg-white/10 transition-all font-medium text-center"
            >
                Увійти
            </Link>

            {/* Кнопка Реєстрація — тепер Link */}
            <Link 
                to="/auth" 
                state={{ mode: 'register' }}
                className="px-6 py-2 bg-white text-pine rounded-lg hover:bg-gold hover:text-pine transition-all font-medium shadow-md text-center"
            >
                Реєстрація
            </Link>
        </div>
    );
};

export default AuuthButtons;
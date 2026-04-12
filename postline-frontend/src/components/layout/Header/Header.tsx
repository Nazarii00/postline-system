
import AuthButtons from "./AuthButtons";
import Navbar from "./Navbar";

const Header = () => {
    return(
        <header className="flex justify-between items-center bg-pine text-white px-10 h-16 shadow-xl">
          <div className="flex items-center text-2xl font-bold tracking-tighter">
            Post<span className="text-pine-accent">line</span>
          </div>

          <Navbar/>
          
          <div className="flex items-center">
            <AuthButtons/>
          </div>
        </header>
    )
}

export default Header;
import { useState } from "react";
import Login from "./Pages/Login";
import Chart from "./Pages/Chart";
import logo from "./assets/LogoRio.png";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  return (
    <>
      {!isLoggedIn && (
        <header className="flex items-center justify-between px-7 py-4 bg-white shadow-md">
          <nav>
            <img
              src={logo}
              alt="Logo RioPele"
              className="h-24 w-auto object-contain"
            />
          </nav>
          <h1 className="text-4xl font-bold text-green-700 font-noto drop-shadow-sm animate-pulse">
            Bem-vindo
          </h1>
        </header>

      )}
      {isLoggedIn ? (
        <Chart nome={username} />
      ) : (
        <Login
          onLogin={(name) => {
            setUsername(name);
            setIsLoggedIn(true);
          }}
        />
      )}
    </>
  );
}

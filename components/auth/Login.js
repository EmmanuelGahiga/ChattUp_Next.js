import React from "react";
import { Toaster } from "react-hot-toast";

export default function Login({
  setIsRegister,
  setUsername,
  handleSubmit,
  username,
  setPassword,
  password,
  error,
  isRegister,
}) {
  const backgroundImageStyle = {
    backgroundImage: "url('/2hnds.jpg')", // Assurez-vous que le chemin correspond à l'emplacement de votre image.
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
  };
  return (
    <>
    <Toaster position="top-left"/>
      <div style={backgroundImageStyle} className="flex items-center justify-center h-screen " >
        {isRegister? (
        <div className="p-10  bg-white rounded-lg shadow-xl w-96">
        <h2 className="text-3xl font-bold mb-10 text-gray-800 text-center">
          Register to ChatApp
        </h2>
        <div className="space-y-5">
          <div className="flex items-center justify-center">
            <>
              
            </>
          </div>
          <div>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
            <label
              className="block text-sm flex justify-center  font-bold mb-2"
              htmlFor="username"
            >
              Username
            </label>
            <input
              className="w-full p-2 border border-gray-300 focus:border-blue-700 focus:outline-none rounded mt-1"
              id="username"
              type="text"
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
              value={username}
            />
          </div>

          <div>
            <label
              className="block text-sm flex justify-center  font-bold mb-2"
              htmlFor="username"
            >
              Password
            </label>
            <input
              className="w-full p-2 border border-gray-300 focus:border-blue-700 focus:outline-none rounded mt-1"
              id="username"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              value={password}
            />
            
          </div>

          <div className="flex justify-center">
            <button
              className="w-[10rem] py-2  bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
              type="button"
              onClick={handleSubmit}
            >
              register
            </button>
          </div>
          <div className="flex space-x-2 justify-center">
            <span>Do you already have an account ?</span>
            <div
                className={`cursor-pointer text-center ${
                  isRegister ? "text-blue-700" : ""
                }`}
                onClick={() => setIsRegister(false)}
              >
                Login
            </div>
          </div>
        </div>
      </div>
      ):(
      <div className="p-10 bg-white rounded-lg shadow-xl w-96">
      <h2 className="text-3xl font-bold mb-10 text-gray-800 text-center">
        Welcome to ChatApp
      </h2>
      <div className="space-y-5">
        {/* <div className="flex items-center justify-center"> 
          <>
            <div className="w-[12rem] h-[2.5rem] bg-blue-600 rounded-sm">
                 <span className="text-md font-semibold text-white flex justify-center mt-1">Login</span>
              </div>
          </>
        </div>*/}
        <div>
          <label
            className="block text-sm  font-bold mb-2"
            htmlFor="username"
          >
            Username
          </label>
          <input
            className="w-full p-2 border border-gray-300 focus:border-blue-700 focus:outline-none rounded mt-1"
            id="username"
            type="text"
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your username"
            value={username}
          />
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>

        <div>
            <label
              className="block text-sm flex justify-center  font-bold mb-2"
              htmlFor="username"
            >
              Password
            </label>
            <input
              className="w-full p-2 border border-gray-300 focus:border-blue-700 focus:outline-none rounded mt-1"
              id="username"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              value={password}
            />
            
          </div>
          
        <div className="flex justify-center">
          <button
            className="w-[10rem] py-2  bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
            type="button"
            onClick={handleSubmit}
          >
            Login
          </button>
        </div>
        <div className="flex space-x-2 justify-center">
          <span>haven't an account ?</span>
          <div
              className={`cursor-pointer text-center ${
                isRegister ? "text-blue-700" : ""
              }`}
              onClick={() => setIsRegister(true)}
            >
              <span className="text-blue-700">Register</span>
          </div>
        </div>
      </div>
    </div>)
      }
        
      </div>
    </>
  );
}

import React, { useEffect, useRef, useState } from "react";


export default function Clear  ({ children })  {
    const clearRef = useRef();
    const [isOpen, setIsOpen] = useState(false);
  
    const handleClick = (e) => {
      if (clearRef.current.contains(e.target)) {
        // à l'intérieur du click
        return;
      }
      // à l'extérieur du click
      setIsOpen(false);
    };
  
    useEffect(() => {
      // ajout de l'écouteur d'évènement lorsque le composant est monté
      document.addEventListener("mousedown", handleClick);
  
      // nettoyage lors du démontage du composant
      return () => {
        document.removeEventListener("mousedown", handleClick);
      };
    });
  
    return (
      <div className="relative" ref={clearRef}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex flex-col p-2 space-y-1 justify-center items-center mr-4 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>

        </div>
        {isOpen && (
          <div className="absolute right-0 w-40 mt-2 py-2 bg-white border rounded shadow-xl">
            {children}
          </div>
        )}
      </div>
    );
  };
  
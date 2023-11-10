import React, { useEffect, useRef, useState } from "react";
import socketIOClient from "socket.io-client";
const ENDPOINT = "http://localhost:3000";
const socket = socketIOClient(ENDPOINT);

const Dropdown = ({ children }) => {
  const dropdownRef = useRef();
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (e) => {
    if (dropdownRef.current.contains(e.target)) {
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
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col p-2 space-y-1 justify-center items-center mr-4 cursor-pointer"
      >
        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
      </div>
      {isOpen && (
        <div className="absolute right-0 w-40 mt-2 py-2 bg-white border rounded shadow-xl">
          {children}
        </div>
      )}
    </div>
  );
};

export default function Chatroom({
    isPrivateChat,
    setIsPrivateChat,
    privateSMS,
    publicSMS,
    loggedUser,
    setChatUser,
    connectedUser,
    chatUser,
    message,
    setMessage,
    sendMessage,
    groupName,
    setGroupName,
    groupID,
    setGroupID,
    groups,
    chatInGroup,
    setChatInGroup,
    unreadCounts,
    setUnreadCounts,
  }) {
    const messagesToShow = isPrivateChat ? privateSMS : publicSMS;

    const [showModal, setShowModal] = useState(false);
    const inputRef = useRef(null);
  
    const changeDiscussion = (group) => {
      setIsPrivateChat(false);
      setChatInGroup(group);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };
  
    const changeChat = (user) => {
      setIsPrivateChat(true);
      setChatUser(user);
  
      setUnreadCounts((prevState) => ({
        ...prevState,
        [user.id]: 0,
      }));
  
      socket.emit("view_chat", user.id);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    const handleEnterKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
          inputRef.current.focus();
        }
      };

  };

import Login from '@/components/auth/Login';
import { ModalContext } from '@/components/context/ModalContext';
import React, { useEffect, useRef, useState } from "react";
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import {v4 as uid} from 'uuid';
import Head from "next/head";
import Modal from '@/components/context/Modal';
import Clear from '@/components/chat/Clear';

/*
const Clear =  ({ children })=>  {
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
        <div className="w-1.5 h-1.5 bg-white ">^</div>
      </div>
      {isOpen && (
        <div className="absolute right-0 w-40 mt-2 py-2 bg-white border rounded shadow-xl">
          {children}
        </div>
      )}
    </div>
  );
};*/

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


export default function Home() {

  const [username, setUsername] = useState("");
  const [password,setPassword]=useState("");
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isRegister, setIsRegister] = useState(false);
  const [loggedUser, setLoggedUser] = useState({});
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [chatUser, setChatUser] = useState({});
  const [chatInGroup, setChatInGroup] = useState([]);
  const [privateSMS, setPrivateSMS] = useState([]);
  const [publicSMS, setPublicSMS] = useState([]);
  const [message, setMessage] = useState("");
  const [isPrivateChat, setIsPrivateChat] = useState(true);
  const [isGroupCreation, setIsGroupCreation] = useState(true);
  const [groupName, setGroupName] = useState("");
  const [groupID, setGroupID] = useState("");
  const [groups, setGroups] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  let messagesToShow = isPrivateChat ? privateSMS : publicSMS;

    const [showModal, setShowModal] = useState(false);
    const inputRef = useRef(null);
  
    const checkUserMembership=(userId, groupId) => {
      if (groups[groupId] && groups[groupId].members[userId]) {
        return true;
      }
      return false;
    }
  
  
    const userInAnyGroup = (userId) => {
      for (let group in groups) {
        if (groups[group].members[userId]) {
          return true;
        }
      }
      return false;
    }
  
    const isUserAdmin = (userId, groupId) => {
      return groups[groupId] && groups[groupId].members[userId] && groups[groupId].members[userId].role === 'admin';
    }

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
  
      setUnreadCounts((unreadState) => ({
        ...unreadState,
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
          handleSendSMS();
          inputRef.current.focus();
        }
      };
    function handleClearDiscussion(messageId,privated){
    if(privated){
      console.log(privated,messageId);
      setPrivateSMS(privateMessage=>privateMessage.filter(message=>message.id !=messageId));
    }
    else{
      console.log(privated,messageId);
      setPublicSMS(publicMessage=>publicMessage.filter(message=>message.id !=messageId));
    }

    
    }
  useEffect(() => {
    const newSocket = io("http://localhost:8000");
    setSocket(newSocket); 

    return () => {
      newSocket.close();
    };
  }, [setSocket]);

  useEffect(() => {
    if (socket) {
      socket.on("registration_failed", (message) => {
        setError(message);
        toast.error("Error while registration !");
      });
      socket.on("registration_successful", (data) => {
        toast.success(
          data.username + " is registrated \n" + "With ID :" + data.id
        );
      });
      socket.on("login_successful", (data) => {
        setLoggedUser({ username: data.username, id: data.id });
        console.log("user connected", data);
      });
      socket.on("login_failed", (data) => {
        toast.error(data);
      });

      socket.emit("connectedUsers");

      socket.emit("avalaible_groups");

      socket.on("update_users", (data) => {
        setConnectedUsers(data);
      });

      socket.on("update_users_logout", (data) => {
        toast.success(data+'user Disconnect')
        setConnectedUsers(data);
        console.log('data:'+data);
      });

      socket.on("private-msg", (data) => {
        console.log(data);
        const newMessage = {
          id:data.id,
          from: data.from,
          to: data.to,
          msg: data.content,
        };
        setPrivateSMS((SMS) => [...SMS, newMessage]);
      });

      socket.on("group_created", (group) => {
        toast.success("Group created ");
        console.log("Group created with ID:", group.groupId);
      });

      socket.on("groups_updated", (updatedGroups) => {
        setGroups(updatedGroups);
        console.log(updatedGroups);
      });

      
      socket.on("group_message", (data) => {
        const newMessage = {
          id:data.id,
          from: data.from,
          to: data.to,
          msg: data.content,
          username: data.username,
        };
        setPublicSMS((pubSMS) => [...pubSMS, newMessage]);
        console.log(newMessage);
      });

      socket.on("update_unread", (data) => {
        setUnreadCounts((unreadState) => ({
          ...unreadState,
          [data.from]: data.count,
        }));
      });

    

    }
  }, [socket]);

  const handleDisconnect=()=>{
    console.log(socket,loggedUser);
    socket.emit("disconnection")
  }
  const handleSubmit = (event) => {
    event.preventDefault();

    if (isRegister) {
      if (socket) {
        socket.emit("register", username,password);
      }
    } else {
      if (socket) {
        socket.emit("login", username,password);
      }
    }
  };
    
  
    
  
    const handleUserClick = (user) => {
      setSelectedUser(user);
    };

    const handleSendSMS = (e) => {
      //e.preventDefault();
      setMessage("");
      if (socket) {
        if (isPrivateChat) {
          const timeStamp=new Date()
          const year=timeStamp.getFullYear()
          const month=String(timeStamp.getMonth()+1).padStart(2,'0')
          const day=String(timeStamp.getDate()).padStart(2,'0')
          const hours=String(timeStamp.getHours()).padStart(2,'0')
          const minutes=String(timeStamp.getMinutes()).padStart(2,'0')
          const seconds=String(timeStamp.getSeconds()).padStart(2,'0')
          const timeToShow=`${year}/${month}/${day} - ${hours}:${minutes}:${seconds}`
          socket.emit("private-msg", {   
            content: message,
            from: loggedUser.id,
            to: chatUser.id,
            fromName: loggedUser.username,
            toName: chatUser.username,
            time:timeToShow
          });
  
          const newMessage = {
            id:uid(),
            from: loggedUser.id,
            to: chatUser.id,
            msg: message,
            time:timeToShow
          };
  
          setPrivateSMS((privSMS) => [...privSMS, newMessage]);
        } else {
          socket.emit("public-msg", {
            content: message,
            from: loggedUser.username,
            to: chatInGroup.groupId,
            username: loggedUser.username,
            time:timeToShow
          });
  
          
        }
      }
    };
  
      /* const handleGroupCreation = () => {
      if (socket) {
        socket.emit("create_group", { groupName: groupName });
      }
      setGroupName("");
    };*/
    const handleGroupCreation = () => {
      if (socket) {
        socket.emit("create_group", { groupName: groupName, creatorId: loggedUser.id, creatorUsername: loggedUser.username });
      }
      setGroupName("");
    };

  return (   
    <>  
    <Head>
        <title>ChatApp</title>
      </Head>
      {Object.keys(loggedUser).length!==0 ?(
        <>
        <ModalContext.Provider
        value={handleGroupCreation}>
    <div className="flex h-screen">
      <div className="w-1/4 bg-gray-200 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
      <div className="sticky top-0 flex-1 bg-gray-300">
       
       <div className='flex justify-between h-[3rem]'>
         <h3 className="text-xl font-bold mb-4 p-4">ChatApp</h3>
         <div className='mt-2'>
            <Dropdown>
                  <a
                    onClick={() => setShowModal(true)}
                    className="block px-4 py-2 cursor-pointer text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Create group
                  </a>
                  <Modal
                    showModal={showModal}
                    setShowModal={setShowModal}
                    groupName={groupName}
                    setGroupName={setGroupName}
                    groupID={groupID}
                    setGroupID={setGroupID}
                    isGroupCreation={isGroupCreation}
                  />
                  <a onClick={handleDisconnect} className="block px-4 py-2 cursor-pointer text-sm text-white-700 hover:bg-gray-100">
                    Logout
                  </a>
            </Dropdown>
         </div>
       </div>
        
       <div className='ml-1 flex space-x-4'>
        <div className='relative'>
          <div className="rounded-full h-12 w-12 bg-white text-white flex items-center justify-center text-2xl font-bold">
            <img src='' alt='' title={`${loggedUser ? loggedUser.username : ""}`} className='w-full' />    
          </div>
          <div className='absolute ml-[2.4rem] -mt-3 w-[0.5rem] h-[0.5rem] rounded-full bg-green-600'></div>
        </div>
          
          <h1 className="text-2xl mt-1 font-bold text-white">
            {loggedUser ? loggedUser.username : ""}
          </h1>
        </div>
        

         
      
      <div className="p-4">
            <input
              className="w-full px-3 py-2 border border-white-300 rounded-lg"
              type="search"
              placeholder="Search ..."
            />
          </div>
          </div>
            {
            Object.keys(groups).length > 0 && userInAnyGroup(loggedUser.id) &&  (
              <>
                
                {Object.values(groups).map((group, index) => (
                <>
                  {checkUserMembership(loggedUser.id, group.groupId) && (
                  <div
                    key={index}
                    onClick={() => changeDiscussion(group)}
                    className="m-2 bg-white cursor-pointer rounded-lg py-2 px-4 flex items-center space-x-2 justify-between border-b border-gray-200"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="rounded-full h-10 w-10 bg-gray-500 text-white flex items-center justify-center text-lg">
                        <img src='/group-chat.png' title={`${group.groupName}`}/>
                      </div>
                      <div className="text-lg">{group.groupName}</div>
                    </div>
                  </div>
                  )}
                  </>
                ))}
              </>
            )}

            {connectedUsers.length>1 &&(
              <>
             
                {connectedUsers.map(
                  (user, index) =>
                  user.username !== loggedUser.username && (
                    <div
                      key={index}
                      onClick={() => changeChat(user)}
                      className="m-2 bg-gray-100 cursor-pointer rounded-lg py-2 px-4 flex items-center space-x-2 justify-between border-b border-gray-200"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="rounded-full h-10 w-10 bg-blue-500 text-white flex items-center justify-center text-lg">
                          {user.username[0]}
                        </div>
                        <div className="text-lg">{user.username}</div>
                      </div>
                      {Object.entries(unreadCounts).map(([userId, count]) => (
                        <div key={userId}>
                          {userId === user.id && count > 0 && (
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-green-600 rounded-full">
                                {count}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )
              )}
              </>
            )}
       {/* <ul>
          {users.map((user) => (
            <li
              key={user.id}
              className={`cursor-pointer text-xl py-2 px-4 ${
                selectedUser && selectedUser.id === user.id ? 'bg-gray-300' : ''
              }`}
              onClick={() => handleUserClick(user)}
            >
              {user.name}
            </li>
          ))}
        </ul>*/} 
      </div>
      {(Object.keys(chatUser).length > 0 || chatInGroup.groupName)?(
      <div className="flex-1 bg-gray-100 flex flex-col">
          <div className='flex-col h-screen'>
            <div className=''>
              <div className="flex-1 bg-gray-300">
                <div className="flex justify-between ">

                   <div className='flex mt-4'>
                      <div className="rounded-full h-12 w-12 bg-blue-500 text-white flex items-center justify-center text-2xl font-bold">
                        {isPrivateChat
                          ? chatUser.username[0]
                          : <img src='/group-chat.png' title={`${chatInGroup.groupName[0]}`}/>}
                      </div>
                      <h2 className="text-xl font-bold -mt-3 mb-5 p-4">
                        {isPrivateChat ? chatUser.username : chatInGroup.groupName}
                      </h2>
                  </div>
                  { isPrivateChat ? " ":
                   <div className='mt-4'>
                     {(isUserAdmin(loggedUser.id, chatInGroup.groupId)) && (
                   <Dropdown>
                  
                    <>
                      <p
                        onClick={() =>
                          setShowModal(true)
                        }
                        className="block px-4 py-2 cursor-pointer text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Add user in group
                      </p>
                      <Modal
                      isGroupCreation={!isGroupCreation}
                      showModal={showModal}
                      setShowModal={setShowModal}
                      connectedUsers={connectedUsers}
                      chatInGroup={chatInGroup}
                    />
                    </>
                    </Dropdown>
                    )}
                  </div>                  
                  }
                  {/* <h2 className="text-xl font-bold mb-4 p-4">{selectedUser.name}</h2> */}
                </div> 
                
              </div >

            <div className=" w-[50rem] grid grdi-cols-1 mx-auto h-[37.5rem]">
              {/* <div className='flex-col bg-blue-600 w-full h-[37.4rem]'> */}
                <div className='flex-col w-full  overflow-auto h-[32rem] space-y-3'>               
                 {messagesToShow.map(
                      (message, index) =>
                        ((isPrivateChat &&
                          ((message.from === loggedUser.id &&
                            message.to === chatUser.id) ||
                            (message.from === chatUser.id &&
                              message.to === loggedUser.id))) ||
                          (!isPrivateChat &&
                            message.to === chatInGroup.groupId)) && (
                  
                    
                    <div key={index} className='  h-auto break-words mt-1 overflow-auto w-[50rem] '>
                      <div className='w-[18rem]'>
                          {message.from === loggedUser.id ? (                           
                            <div className='group flex flex-col  space-y-3 h-auto  ml-[31rem] w-[18rem] ' >   
                                  <div className='flex'>                          
                                    <span className=' bg-blue-600 text-white h-auto w-max ml-2 p-2 rounded-tr-lg rounded-br-md rounded-bl-lg'>
                                      {message.msg}
                                   </span>                           
                                  <div className='absolute ml-2 invisible bg-blue-600 w-4  group-hover:visible  bg-black  '>
                                      <Clear>
                                        <p
                                          onClick={() =>
                                            handleClearDiscussion(message.id,isPrivateChat)
                                          }
                                          className=" block px-4 py-2 cursor-pointer text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                          Clear discussion
                                        </p>
                                      </Clear>
                                  </div>
                                 </div> 
                                </div> 
                          ):(
                            <div className=' flex flex-col ml-3 mt-2  justify-end space-y-3 w-[18rem]' >
                              <div className='group flex'>
                                <div className='flex'>
                                      <span className="rounded-full h-10 w-10 bg-gray-500 text-white flex items-center justify-center text-lg">
                                            {isPrivateChat
                                                  ? chatUser.username[0]
                                                  : message.username[0]}
                                      </span> 
                                        <span className='bg-gray-400 text-white h-auto w-auto mx-2 rounded-tl-lg rounded-bl-md rounded-br-md p-1 '>
                                    {message.msg}
                                  </span>
                                </div>                       
                                <div className='absolute ml-12 h-0 -mt-2 invisible  bg-gray-400 w-4  group-hover:visible  bg-black  '>
                                      <Clear>
                                        <p
                                          onClick={() =>
                                            handleClearDiscussion(message.id,isPrivateChat)
                                          }
                                          className=" block px-4 py-2 cursor-pointer text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                          Clear discussion
                                        </p>
                                      </Clear>
                                  </div>
                                </div>
                            </div>
                          
                            )}
                      </div>
                    </div>                    

                  ))} 
                </div>              
                  {/* Ajoutez d'autres messages ici */}
                  <div className="w-full h-[3.2rem]">
                    <form className="w-full mx-auto flex">
                      <input
                        ref={inputRef}
                        type="text"
                        placeholder="Entrez votre message..."
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleEnterKey}
                        value={message}
                        className="bg-white mt-1 border border-gray-300 rounded-full px-4 py-2 w-full focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="submit"
                        onClick={handleSendSMS}
                        className="bg-blue-500 mt-1 hover:bg-blue-600 text-white font-bold w-[3.5rem] h-[3rem]  rounded-full ml-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="ml-2 w-10 h-10">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>

                      </button>
                    </form>
                  </div>

              {/* </div> */}


              
              </div>
            </div>
          </div>
          
        
        
      </div>
      ):(
      // <p className="text-center text-gray-500">Sélectionnez un utilisateur pour commencer la discussion.</p>
      <img
      src="/bckg.jpg" // Remplacez par le chemin de votre image de remplacement
      alt="Placeholder"
      className="mx-auto"
    />
      )}
      </div>
     </ModalContext.Provider>
      </>):(
    <Login 
     username={username}
     password={password}
    error={error}
    isRegister={isRegister}
    handleSubmit={handleSubmit}
    setIsRegister={setIsRegister}
    setUsername={setUsername}
    setPassword={setPassword}/>
  )
}
  </>

);
}



  
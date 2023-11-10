import React, { useContext,useState } from "react";
import { ModalContext } from "./ModalContext";
import socketIOClient from "socket.io-client";
const ENDPOINT = "http://localhost:8000";
const socket = socketIOClient(ENDPOINT);



function Modal({
  isGroupCreation,
  showModal,  
  setShowModal,
  groupName,
  setGroupName,
  connectedUsers,
  chatInGroup
})  {
  if (!showModal) {
    return null;
  }

  const handleGroupCreation = useContext(ModalContext);
  const [selectedUser, setSelectedUser] = useState({});

  const add_User_in_Group = () => {
    if (socket) {
      socket.emit("add_user_to_group", { user: selectedUser, chatInGroup });
    }
  }

  return (
    <div
      className="fixed z-10 inset-0 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
        ></div>
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <button
            type="button"
            className="absolute top-3 right-4  text-white bg-red-500 hover:bg-red-700 rounded-lg p-1"
            onClick={() => setShowModal(false)}
          >
            close
          </button>

          {isGroupCreation && (<>
          <div className="bg-white mt-6 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <div className="flex items-center mt-2">
                <label className="w-1/4 text-lg leading-6 font-medium text-gray-900">
                  Group Name
                </label>
                <input
                  className="w-3/4 p-2 border border-gray-300 rounded mt-1"
                  id="groupName"
                  onChange={(e) => setGroupName(e.target.value)}
                  value={groupName}
                  type="text"
                  placeholder="Input group's name"
                />
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-1 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-5 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
              onClick={handleGroupCreation}
            >
              Create group
            </button>
          </div>
          </>)}

          {!isGroupCreation && (
            <>
              <div className="bg-white mt-6 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Connected users</label>
                <select
                  value={selectedUser ? selectedUser.id : ''}
                  onChange={(e) => {
                    const selectedUserId = e.target.value;
                    const user = connectedUsers.find(client => client.id === selectedUserId);
                    setSelectedUser(user);
                  }}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                >
                  <option value="" >Select user to add</option>
                  {connectedUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username}
                    </option>
                  ))}
                </select>



              </div>
              <div className="bg-gray-50 px-4 py-1 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-5 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => add_User_in_Group()}
                >
                  Add to group
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Modal;

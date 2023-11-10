const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require("uuid");
//const cors = require('cors');

// Stockage des messages
const messages = {};
let connectedUsers = [];
let groups = {};
// Stockage des utilisateurs
const users = {};
let userId = [];
let myUsername = [];
let unreadCounts = {};


const httpServer = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Socket.IO server');
  });
  
  const io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:3000',
    },
  });

  function resetCounterForPair(userId, chatWithUserId) {
    if (unreadCounts[userId] && unreadCounts[userId][chatWithUserId]) {
        unreadCounts[userId][chatWithUserId] = 0;
    }
    // Vous pouvez également avoir besoin de gérer l'autre sens, c'est-à-dire
    // si chatWithUserId a des messages non lus de userId
    if (unreadCounts[chatWithUserId] && unreadCounts[chatWithUserId][userId]) {
        unreadCounts[chatWithUserId][userId] = 0;
    }
}

io.on('connection', (socket) => {
  // console.log('Nouveau utilisateurs connecté:', socket.id);
  {/*socket.on("create_group", (group) => {
    const groupId = uuidv4(); // ID unique pour chaque groupe créé
    socket.join(groupId);

    // Ajouter le groupe à la liste des groupes
    groups[groupId] = { groupName: group.groupName, groupId: groupId };

    // Envoyer la liste des groupes à tous les utilisateurs
    io.emit("groups_updated", groups);

    // Renvoie l'ID du groupe au utilisateur
    socket.emit("group_created", {
      groupId: groupId,
      groupName: group.groupName,
    });
  });*/}
  socket.on("create_group", (group) => {
    const groupId = uuidv4();
    // Le créateur du groupe est automatiquement ajouté comme membre 
    // avec un rôle d'administrateur.
    groups[groupId] = {
      groupName: group.groupName,
      groupId: groupId,
      members: {
        [group.creatorId]: {
          username: group.creatorUsername,
          role: "admin"
        }
      }
    };

    // Réjoindre le créateur du groupe à la salle du groupe.
    socket.join(groupId);

    socket.emit("group_created", {
      groupId: groupId,
      groupName: group.groupName,
      members: {
        [group.creatorId]: {
          username: group.creatorUsername,
          role: "admin"
        }
      }
    });

    io.emit("groups_updated", groups);
  });
  
  socket.on('add_user_to_group', (data) => {
    const user = data.user;
    const groupId = data.chatInGroup.groupId;

    // Vérifiez que le groupe existe
    if (groups[groupId]) {
      // Ajoutez l'utilisateur au groupe
      groups[groupId].members[user.id] = user;
      io.emit("groups_updated", groups);
      socket.emit("member_added", "Member added successfully")


      // Ensuite, vous pouvez émettre un événement de confirmation si nécessaire, ou effectuer d'autres actions.
    } else {
      console.error('Groupe non trouvé!');
    }
  });

  socket.on("avalaible_groups", () => {
    io.emit("groups_updated", groups);
  });

  socket.on("register", (username,password) => {
    console.log(username);
    if (users[username]) {
      socket.emit("registration_failed", "Ce nom d'utilisateur est déjà pris.");
    } else if(username && password) {
      users[username] = {
        socketId: socket.id,
        password:password
      };

      socket.emit("registration_successful", {
        message: "Vous avez été enregistré avec succès.",
        id: users[username].socketId,
        username: username,
      });

      console.log(
        `${username} has been registered with socket id of ${socket.id}`
      );
    }
    else{
      socket.emit("registration_failed", "veuillez remplir tous les champs.")
    }
  });

  socket.on("login", (username,password) => {
    if (users[username]&&users[username].password==password) {
      socket.emit("login_successful", {
        username: username,
        id: users[username].socketId,
      });
      myUsername = username;
      userId = users[username].socketId;
      // Ajouter l'utilisateur connecté à la liste
      connectedUsers.push({
        username: username,
        password:users[username].password,
        id: users[username].socketId,
      });

      // Émettre l'événement 'update_clients' à tous les clients connectés
      io.emit("update_users", connectedUsers);

      console.log(`${username} has logged in with socket id of ${socket.id}`);
    } else {
      socket.emit("login_failed", "Le nom d'utilisateur ou mot de passe est incorrect.");
    }
  });

  socket.on("connectedUsers", () => {
    // Envoyez les clients connectés sur tous les clients
    io.emit("update_users", connectedUsers);
  });

  socket.on("disconnection", () => {
    console.log(`User with socket id ${socket.id} has disconnected with a click`);

    // io.emit("login_successful", {
    //   username: myUsername,
    //   id: userId, 
    // });

    // Trouvez l'utilisateur dans le tableau 'connectedUsers' qui a la même socket.id que le client déconnecté
    
      const index = connectedUsers.findIndex((user) => user.id === socket.id);
      connectedUsers.map(user=>{
        user.id==socket.id ? console.log(user.username):console.log("noo");
      })
    
       console.log('index:'+ index);

    if (index !== -1) {
      // Supprimez l'utilisateur du tableau
      connectedUsers.splice(index, 1);
      console.log(connectedUsers[index]);
      // Émettez l'événement 'update_users' pour mettre à jour la liste des clients sur tous les clients restants
      io.emit("update_users_logout", connectedUsers);
    }
  });

  // Gérer les nouveaux utilisateurs
{/*  socket.on('user:join', (username) => {
    const user = {
      id: socket.id,
      username,
    };
    users.push(user);
    io.emit('user:list', users);
  });

  // Gérer les messages du client
  socket.on('chat:message', (message) => {
    const fullMessage = {
      user: socket.id,
      text: message,
      timestamp: Date.now(),
    };
    messages.push(fullMessage);
    io.emit('chat:message', fullMessage);
  });

  // Gérer la déconnexion du client
  socket.on('disconnect', () => {
    console.log('Client déconnecté:', socket.id);
    const index = users.findIndex((user) => user.id === socket.id);
    if (index !== -1) {
      users.splice(index, 1);
      io.emit('user:list', users);
    }
  });*/}


  socket.on("private-msg", ({ content, from,fromName, to,toName ,time}) => {
    console.log(`Message: ${content} from ${fromName} to ${toName} at ${time}`);
    if (!unreadCounts[to]) {
      unreadCounts[to] = {};
    }
    if (!unreadCounts[to][from]) {
      unreadCounts[to][from] = 0;
    }

    unreadCounts[to][from]++;

    // Envoyer le message à la socket spécifique
    socket.to(to).emit("private-msg", { id: uuidv4(),content, from: from, to: to });
    io.to(to).emit("update_unread", {
      from: from,
      count: unreadCounts[to][from],
    });
  });

  socket.on("view_chat", (chatWithUserId) => {
    if (unreadCounts[userId] && unreadCounts[userId][chatWithUserId]) {
      unreadCounts[userId][chatWithUserId] = 0;
    }
    resetCounterForPair(userId, chatWithUserId);
    socket.emit("update_unread", { from: chatWithUserId, count: 0 });
  });

  socket.on("public-msg", ({ content, from, to, username,time }) => {
    const message = {
      id: uuidv4(),
      from: from,
      to: to,
      content: content,
      username: username,
    };

    io.emit("group_message", message);
    //io.to(to).emit("group_message", message);
    console.log(`Message: ${content} from ${from} to ${to} at ${time}`);
  });

  socket.on("disconnect", () => {
    console.log(`User with socket id ${socket.id}  has disconnected`);

    // io.emit("login_successful", {
    //   username: myUsername,
    //   id: userId, 
    // });

    // Trouvez l'utilisateur dans le tableau 'connectedUsers' qui a la même socket.id que le client déconnecté
    
      const index = connectedUsers.findIndex((user) => user.id === socket.id);
    
    

    if (index !== -1) {
      // Supprimez l'utilisateur du tableau
      connectedUsers.splice(index, 1);
      // Émettez l'événement 'update_clients' pour mettre à jour la liste des clients sur tous les clients restants
      io.emit("update_users_logout", connectedUsers);
    }
  });

});

httpServer.listen(8000, () => {
  console.log('Serveur en écoute sur le port 8000');
});
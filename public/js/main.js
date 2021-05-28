const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
const key = document.querySelector(".key");

console.log("ROOM", roomName, key);
//Get username and room from the url

const { username, room, sk } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

if (!sk) {
  window.location = "index.html";
}

if (sk.length != 24) {
  window.location = "index.html";
}

const socket = io();

socket.emit("joinRoom", { username, room });

//Get room users

socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

//message from server
socket.on("message", (message) => {
  console.log(message);
  url = "http://localhost:3000/decrypt?message=" + message.text;
  console.log("URL : " + url);
  fetch(url)
    .then((res) => res.json())
    .then((decrypted) => {
      console.log("DECRYPTED ", decrypted);
      outputMessage({
        username: message.username,
        text: decrypted,
        time: message.time,
      });
    });

  //Put scroll function
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//On message Submission - Submit button press karne ke baad

chatForm.addEventListener("submit", (x) => {
  x.preventDefault();
  const msg = x.target.elements.msg.value; //Get what is written by user in msg

  //Emitting msg to server
  url = "http://localhost:3000/encrypt?message=" + msg;
  fetch(url)
    .then((res) => res.json())
    .then((encrypted) => {
      socket.emit("chatMessage", encrypted);
    });

  //Every time you submit a message, it will clear your input field but
  //keep the cursor their itself(focus)
  x.target.elements.msg.value = "";
  x.target.elements.msg.focus();
});
//output message to DOM
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username} </p>
    <p></p>
    <p class="text">
        ${message.text}
    </p>
    <p class="meta" style="
    padding-left: 650px;
    margin-bottom: 0px;"> <span>${message.time}</span></p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

//Add room name to DOM

function outputRoomName(room) {
  roomName.innerText = room;
}

//Add users name to DOM

function outputUsers(users) {
  userList.innerHTML = `
        ${users.map((user) => `<li> ${user.username} </li>`).join("")}

    `;
}

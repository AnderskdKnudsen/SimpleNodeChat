$(document).ready(() => {
    var socket = io.connect("http://localhost:3000");
    var app = new Vue({
        el: '#app',
        data: {
            message: '',
            messages: [],
            username: '',
            users: [],
            numberOfClients: 0
        },
        mounted() {
            this.getMessages();
            this.listenForMessages();
            this.promptUsername();
            this.postUsername();
            this.updateUsers();
        },
        methods: {
            promptUsername() {
                const username = prompt("Welcome to the chatroom\nPlease choose a username.", "Username");

                const doRandom = [
                    null,
                    "",
                    "Username"
                ];

                if (doRandom.indexOf(username) === -1) {
                    this.username = username;
                    return;
                }

                $.ajax({
                    type: "GET",
                    url: 'https://randomuser.me/api/',
                    dataType: 'json'
                }).then(data => {
                    this.username = data.results[0].name.first + " " + data.results[0].name.last;
                });
            },
            getMessages() {
                $.get("get-messages", response => {
                    this.messages = response;
                    this.scrollToBottom();
                });
            },
            listenForMessages() {
                socket.on("chat message", msg => {
                    this.messages.push(msg);
                    this.scrollToBottom();
                });
            },
            scrollToBottom() {
                var chat = this.$refs.chat;

                setTimeout(function () {
                    chat.scrollTo(0, chat.scrollHeight)
                }, 0);
            },
            sendMessage() {
                const postMessage = {
                    name: this.username,
                    message: this.message
                }
                socket.emit("chat message", postMessage);
                this.message = '';
            },
            postUsername() {
                socket.on("askForUsername", () => {
                    socket.emit("foundUsername", this.username);
                });
            },
            updateUsers() {
                socket.on("updateUsers", usersAndNumber => {
                    this.users = [];
                    usersAndNumber.users.forEach(u => {
                        this.users.push(u);
                    });
                    console.log(this.users);
                    this.numberOfClients = usersAndNumber.numberOfClients;
                });
            }
        }
    });
});
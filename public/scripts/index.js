$(document).ready(() => {

    let socket = io.connect("http://localhost:3000");

    let username = window.prompt("Welcome to the chatroom\nPlease choose a username.", "Username");
    if(username == null || username === "" || username === "Username")
    {
        $.ajax({
            type: "GET",
            url: 'https://randomuser.me/api/',
            dataType: 'json'
        }).then(data => {
            username = data.results[0].name.first + " " + data.results[0].name.last;
        });
    }

    $(() => {
        $('form').submit(() => {
            socket.emit("chat message", $("#m").val());
            $('#m').val("");
            return false;
        });
    });

    socket.on("chat message", msg => {
        $("#messages").append($('<li>').text(username + ": " + msg));
    });
});
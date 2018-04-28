$(document).ready(() => {
    var usernameParam = getParameterByName("username");
    $(".login-username").val(usernameParam);

    $("form").submit(event => {
        event.preventDefault();
        let username = $(".login-username").val();
        let password = $(".login-password").val();

        let loginData = {
            "username": username,
            "password": password
        };

        $.ajax({
            type: "POST",
            url: "login-user",
            data: loginData
        }).done(response => {
            
        });
    });

    $(".redirect-to-submit-btn").on("click", () => {
       window.location = "submituser.html";
    });
});

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
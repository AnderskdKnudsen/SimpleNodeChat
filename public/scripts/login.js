$(document).ready(() => {
    $(".loader").hide();

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
            if (response.status === 200) {
                $(".loader").show();
                $(".login-info").empty();
                $(".login-info").append("<p class='text-success'>" + response.message + "</p>");
                setInterval(() => {
                    $(".loader").hide();
                    window.location = "/index.html";
                }, 3000);
            } else if (response.status === 404){
                $(".login-info").empty();
                $(".login-info").append("<p class='text-danger'>" + response.message + "</p>");
            } else if (response.status === 500) {
                $(".login-info").empty();
                $(".login-info").append("<p class='text-danger'>" + response.message + "</p>");
            }
        });
    });

    $(".redirect-to-submit-btn").on("click", () => {
       window.location = "submituser.html";
    });
});

//Thankfully lended from stackoverflow
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
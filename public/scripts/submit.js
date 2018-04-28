$(document).ready(() => {
    $(".loader").hide();

        $("form").submit(event => {
        event.preventDefault();
        let username = $(".submit-username").val();
        let password = $(".submit-password").val();
        let email = $(".submit-email").val();

        var submitData = {
            "username": username,
            "password": password,
            "email": email
        };
        
        $.ajax({
            type: "POST",
            url: "submit-user",
            data: submitData
        }).done(response => {
            if(response.status === 200){
                $(".submit-info").empty();
                $(".loader").show();
                $(".submit-info").append("<p class='text-success'>" + response.message + "</p>");
                setInterval(() => {
                    $(".loader").hide();
                    window.location = "/login.html" + "?username="+username;
                }, 3000);
            } else if(response.status === 403) {
                $(".submit-info").empty();
                $(".submit-info").append("<p class='text-danger'>" + response.message + "</p>");
            } else if(response.status === 500) {
                $(".submit-info").empty();
                $(".submit-info").append("<p class='text-danger'>" + response.message + "</p>");
            }
        });
    });
});
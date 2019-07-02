$(document).ready(function () {

    $('#uname').keypress(function(e) {
        var key = e.which;
        if (key == 13) // the enter key code
        {
            $('#btn-login').click();
            return false;
        }
    });

    $('#psw').keypress(function(e) {
        var key = e.which;
        if (key == 13) // the enter key code
        {
            $('#btn-login').click();
            return false;
        }
    });

    $('#btn-login').click(function (e) {
        var login = {
            "username": $('#uname').val(),
            "password": $('#psw').val()
        };
        $.ajax({
            url: $('base#gateway').attr('href') + 'login',
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(login),
            success: function (data, textStatus, jqXHR) {
                // if (data.status === "failed") {
                //         toastr.options = {
                //             "timeOut": "10000"
                //         };
                //         toastr['error'](data.exception.Message);
                //     // notification('error', data.exception.Message);
                // } else {
                    localStorage.setItem("bearer", data.bearer);
                    localStorage.setItem("intro", "true");
                    window.location = "manager";
                // }
            },
            complete: function (jqXHR, textStatus) {
            },
            error: function (jqXHR, textStatus, errorThrown) {
                toastr.options = {
                    "timeOut": "10000"
                };
                toastr['error'](jqXHR.responseJSON.exception.Message);
                // console.log(errorThrown);
            },
            statusCode: {
                200: function () {
                    console.log('OK 200')
                },
                204: function () {
                    console.log('Empty 204')
                },
                400: function () {
                    console.log('Bad Request 400');
                    $('#example tbody')
                        .empty()
                        .append('<tr><td colspan="6" class="dataTables_empty">Bad request</td></tr>')
                },
                500: function () {
                    console.log('Internal server error 500');
                    $('#example tbody')
                        .empty()
                        .append('<tr><td colspan="6" class="dataTables_empty">Internal server error</td></tr>')
                }
            }
        });
    });
});

function loadLocalStorage() {
    // if (typeof(Storage) !== "undefined") {
    //     if (localStorage.getItem("bearer") != null) {
    //         window.location = "manager";
    //     }
    // } else {
    //     alert("Sorry! No 'Browser Storage' support..");
    // }
}

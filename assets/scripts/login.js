$(document).ready(function () {

    $('#uname').keypress(function (e) {
        let key = e.which;
        if (key === 13) {
            $('#btn-login').click();
            return false;
        }
    });

    $('#psw').keypress(function (e) {
        let key = e.which;
        if (key === 13) {
            $('#btn-login').click();
            return false;
        }
    });

    $('#btn-login').click(function (e) {
        let login = {
            "username": $('#uname').val(),
            "password": $('#psw').val()
        };
        $.ajax({
            url: $('base#gateway').attr('href') + 'login',
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(login),
            success: function (data) {
                localStorage.setItem("bearer", data.bearer);
                localStorage.setItem("intro", "true");

                window.location = "manager";
            },
            complete: function (jqXHR, textStatus) {
            },
            error: function (jqXHR, textStatus, errorThrown) {
                toastr.options = {
                    "timeOut": "10000"
                };
                toastr['error'](jqXHR.responseJSON.exception.Message);
            },
            statusCode: {
                400: function () {
                    $('#example tbody').empty().append('<tr><td colspan="6" class="dataTables_empty">Bad request</td></tr>')
                },
                500: function () {
                    $('#example tbody').empty().append('<tr><td colspan="6" class="dataTables_empty">Internal server error</td></tr>')
                }
            }
        });
    });
});

function loadLocalStorage() {
    if (typeof (Storage) !== "undefined") {
        if (localStorage.getItem("bearer") !== null) {
            window.location = "manager";
        }
    } else {
        alert("Sorry! No 'Browser Storage' support...");
    }
}

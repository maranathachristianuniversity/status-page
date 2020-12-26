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
        e.preventDefault();
        let login = {
            username: $('#uname').val(),
            password: $('#psw').val()
        };
        $.ajax({
            url: $('base#gateway').attr('href') + 'login',
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(login),
            success: function (data) {
                //check permissions
                $.ajaxSetup({
                    timeout: 30000,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'Bearer ' + data.bearer);
                    }
                });
                $.ajax({
                    url: $('base#gateway').attr('href') + 'data',
                    type: 'POST',
                    dataType: 'json',
                    contentType: 'application/json',
                    error: function (jqXHR) {
                        notification('error', jqXHR.responseJSON.exception.Message);
                    },
                    success: function (response) {
                        let res = response.user;
                        let user = res.user;
                        let permissions = res.permissions;

                        if (permissions.includes('SDV')) {
                            localStorage.setItem("bearer", data.bearer);
                            localStorage.setItem("intro", "true");
                            window.location = "manager";
                        } else {
                            notification('error', `Maaf ${user.displayname}, user anda ${user.nipnrp} tidak diberikan akses untuk mengakses fungsi ini.`);
                        }
                    }
                });
            },
            error: function (jqXHR) {
                notification('error', jqXHR.responseJSON.exception.Message);
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

function notification(type, message) {
    toastr.options = {
        timeOut: 10000,
        onclick: function () {}
    };
    toastr[type](message);
}

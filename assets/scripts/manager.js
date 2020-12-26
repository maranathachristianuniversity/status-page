$.ajaxSetup({
    timeout: 30000,
    beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("bearer"));
    }
});

$(function () {
    init();

    //on expand error display
    $(document).on('click', '.expand-service', function (evt) {
        evt.preventDefault();
        let id = $(this).attr('id');
        let area_expanded = $(this).attr('aria-expanded');
        if (area_expanded === 'true') {
            $.ajax({
                url: $('base#api').attr('href') + 'healthstatus/search',
                dataType: 'json',
                type: 'POST',
                data: JSON.stringify({
                    idhealth: id,
                    isresolved: 0
                }),
                success: function (data) {
                    let healthstatus = data.healthstatus;
                    let trace = ``;
                    $.each(healthstatus, function (x, y) {
                        let problem = JSON.parse(y.problem);
                        $.each(problem, function (a, b) {
                            trace += `<p><b>${y.iteration}x error | ${b.text}</b></p>`;
                            trace += `<pre>`;
                            $.each(b.fields, function (c, d) {
                                trace += `<p><b>${d.value}</b></p>`;
                            });
                            trace += `</pre>`;
                        });
                        trace += `<a class="btn btn-primary mark-issue" id="${y.id}" data-idhealthstatus="${y.id}" style="margin-right: 15px">Mark issue resolved</a>`;
                        trace += `<a class="btn btn-default add-incidents" id="${y.id}" style="margin-right: 15px">Add incidents notes</a>`;
                    });
                    if (healthstatus.length > 0) {
                        $(`.expand-service-${id}`).html(trace);
                    } else {
                        $(`.expand-service-${id}`).html(`Modules working perfectly!`);
                    }

                },
                error: function (jqXHR) {
                    notification('error', jqXHR.responseJSON.exception.Message);
                }
            });
        }
    });

    $('#add-microservices').on('click', function () {
        let forms = `<div class="form-group">
                        <div class="control-label">App Identifier:</div>
                        <input type="text" class="form-control" id="appidentifier">
                    </div>
                    <div class="form-group">
                        <div class="control-label">Display Name:</div>
                        <input type="text" class="form-control" id="displayname" >
                    </div>
                    <div class="form-group">
                        <div class="control-label">Health Status:</div>
                        <select class="form-control" id="healthstatus" style="width: 100%;">
                            <option value="operational">Operational</option>
                            <option value="warning">Warning</option>
                            <option value="error">Error</option>
                            <option value="deprecated">Deprecated</option>
                            <option value="off">Off</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <div class="control-label">Description:</div>
                        <textarea class="form-control" id="description" rows="4"></textarea>
                    </div>`;

        let add_service_box = bootbox.dialog({
            title: 'Lengkapi Data Module',
            message: forms,
            size: 'small',
            buttons: {
                cancel: {
                    label: "Batalkan",
                    className: 'btn-default',
                    callback: function () {}
                },
                ok: {
                    label: "Simpan",
                    className: 'btn-primary',
                    callback: function (evt) {
                        evt.preventDefault();
                        let create = {
                            appidentifier: $('#appidentifier').val(),
                            displayname: $('#displayname').val(),
                            healthstatus: $('#healthstatus').val(),
                            description: $('#description').val()
                        };
                        $.ajax({
                            url: $('base#api').attr('href') + 'health/create',
                            dataType: 'json',
                            type: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify(create),
                            success: function (data) {
                                notification('success', "Microservices berhasil ditambah");
                                add_service_box.modal('hide');
                                init();
                            },
                            error: function (jqXHR) {
                                notification('error', jqXHR.responseJSON.exception.Message);
                            }
                        });
                        return false;
                    }
                }
            }
        });
        add_service_box.init(function () {
            $('.bootbox').removeAttr('tabindex');
            $('#healthstatus').select2({
                placeholder: 'Select an option'
            });
        });
    });

    $('.div-microservices').on('click', '.editMicroservices', function () {
        let x = $(this).attr('id');
        $.ajax({
            url: $('base#api').attr('href') + 'health/' + x,
            dataType: 'json',
            type: 'GET',
            contentType: 'application/json',
            success: function (data) {
                let forms = `<div class="form-group">
                                <div class="control-label">App Identifier:</div>
                                <input type="text" class="form-control" id="appidentifierUpdate" value="${data.health.appidentifier}">
                             </div>
                             <div class="form-group">
                                <div class="control-label">Display Name:</div>
                                <input type="text" class="form-control" id="displaynameUpdate" value="${data.health.displayname}">
                             </div>
                             <div class="form-group">
                                <div class="control-label">Health Status:</div>
                                <select class="form-control" id="healthstatusUpdate" style="width: 100%;">
                                    <option value="operational">Operational</option>
                                    <option value="warning">Warning</option>
                                    <option value="error">Error</option>
                                    <option value="deprecated">Deprecated</option>
                                    <option value="off">Off</option>
                                </select>
                             </div>
                             <div class="form-group">
                                <div class="control-label">Description:</div>
                                <textarea class="form-control" rows="4" id="descriptionUpdate">${data.health.description}</textarea>
                             </div>`;

                let edit_box = bootbox.dialog({
                    title: 'Ubah Data',
                    message: forms,
                    size: 'small',
                    buttons: {
                        cancel: {
                            label: "Batalkan",
                            className: 'btn-default',
                            callback: function () {
                            }
                        },
                        ok: {
                            label: "Simpan",
                            className: 'btn-primary',
                            callback: function (evt) {
                                evt.preventDefault();
                                let update = {
                                    appidentifier: $('#appidentifierUpdate').val(),
                                    displayname: $('#displaynameUpdate').val(),
                                    healthstatus: $('#healthstatusUpdate').val(),
                                    description: $('#descriptionUpdate').val(),
                                    remark: ""
                                };
                                $.ajax({
                                    url: $('base#api').attr('href') + 'health/' + x + '/update',
                                    dataType: 'json',
                                    type: 'POST',
                                    contentType: 'application/json',
                                    data: JSON.stringify(update),
                                    success: function (data) {
                                        notification('success', "Microservices berhasil diubah");
                                        edit_box.modal('hide');
                                        init();
                                    },
                                    error: function (jqXHR) {
                                        notification('error', jqXHR.responseJSON.exception.Message);
                                    }
                                });
                                return false;
                            }
                        }
                    }
                });
                edit_box.init(function () {
                    $('.bootbox').removeAttr('tabindex');
                    $('#healthstatusUpdate').select2({
                        placeholder: 'Select an option'
                    });
                    $('#healthstatusUpdate').val(data.health.healthstatus).change();
                });
            },
            error: function (jqXHR) {
                notification('error', jqXHR.responseJSON.exception.Message);
            }
        });
    });

    $('.div-microservices').on('click', '.deleteMicroservices', function () {
        let x = $(this).attr('id');
        let delete_box = bootbox.dialog({
            title: 'Hapus Data',
            message: 'Apakah Anda yakin ingin menghapus data ini?',
            size: 'small',
            buttons: {
                cancel: {
                    label: "Batalkan",
                    className: 'btn-default',
                    callback: function () {}
                },
                ok: {
                    label: "Hapus",
                    className: 'btn-primary',
                    callback: function (evt) {
                        evt.preventDefault();
                        $.ajax({
                            url: $('base#api').attr('href') + 'health/' + x + '/delete',
                            dataType: 'json',
                            type: 'GET',
                            contentType: 'application/json',
                            success: function (data) {
                                if (data.status === "failed") {
                                    notification('error', data.exception.Message);
                                } else {
                                    notification('success', "Microservices berhasil dihapus");
                                    delete_box.modal('hide');
                                    init();
                                }
                            },
                            error: function (jqXHR) {
                                notification('error', jqXHR.responseJSON.exception.Message);
                            }
                        });
                        return false;
                    }
                }
            }
        });
    });

    $('.div-microservices').on('click', '.mark-issue', function () {
        let x = $(this).attr('id');
        let idhealthstatus = $(this).attr('data-idhealthstatus');

        $.ajax({
            url: $('base#api').attr('href') + 'healthstatus/' + idhealthstatus,
            dataType: 'json',
            type: 'GET',
            contentType: 'application/json',
            success: function (data) {
                $.ajax({
                    url: $('base#api').attr('href') + 'healthstatus/' + x + '/update',
                    dataType: 'json',
                    type: 'POST',
                    data: {
                        idhealth: x,
                        isresolved: 1
                    },
                    success: function (data) {
                        notification('success', "Issue resolved.");
                    },
                    error: function (jqXHR) {
                        notification('error', jqXHR.responseJSON.exception.Message);
                    }
                });
            }
        });
    });

    $('.div-microservices').on('click', '.add-incidents', function () {
        let x = $(this).attr('id');
        let forms = `<div class="form-group">
                        <div class="control-label">Post Date:</div>
                        <div class="input-group date tglSK" data-provide="datepicker">
                            <input type="text" name="postdate" class="form-control" placeholder="DD/MM/YYYY hh:mm">
                            <div class="input-group-addon">
                                <span class="fa fa-calendar"></span>
                            </div>
                        </div>
                     </div>
                     <div class="form-group">
                        <div class="control-label">Tag:</div>
                        <select class="form-control" id="tagIncidents" style="width: 100%;">
                            <option value="Identified">Identified</option>
                            <option value="On Progress">On Progress</option>
                            <option value="Done">Done</option>
                        </select>
                     </div>
                     <div class="form-group">
                        <div class="control-label">Message:</div>
                        <textarea class="form-control" id="message" rows="4"></textarea>
                     </div>`;

        let incidents_box = bootbox.dialog({
            title: 'Tambahkan Catatan Kesalahan',
            message: forms,
            size: 'small',
            buttons: {
                cancel: {
                    label: "Batalkan",
                    className: 'btn-default',
                    callback: function () {
                    }
                },
                ok: {
                    label: "Simpan",
                    className: 'btn-primary',
                    callback: function (evt) {
                        evt.preventDefault();
                        let create = {
                            idhealthstatus: x,
                            postdate: $('input[name=postdate]').val(),
                            message: $('#message').val(),
                            tag: $('#tagIncidents').val()
                        };
                        $.ajax({
                            url: $('base#api').attr('href') + 'incidents/create',
                            dataType: 'json',
                            type: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify(create),
                            success: function (data) {
                                notification('success', "Incidents berhasil ditambah");
                                incidents_box.modal('hide');
                                init();
                            },
                            error: function (jqXHR) {
                                notification('error', jqXHR.responseJSON.exception.Message);
                            }
                        });
                        return false;
                    }
                }
            }
        });
        incidents_box.init(function () {
            $('.bootbox').removeAttr('tabindex');

            $('#tagIncidents').select2({
                placeholder: 'Select an option'
            });

            let postdate = $('input[name=postdate]').datetimepicker({
                format: 'DD/MM/YYYY HH:mm'
            });
            postdate.on('dp.hide', function (evt) {});
        });
    });

    $('.div-incidents').on('click', '.editIncidents', function () {
        let x = $(this).attr('id');
        $.ajax({
            url: $('base#api').attr('href') + 'incidents/' + x,
            dataType: 'json',
            type: 'GET',
            contentType: 'application/json',
            success: function (data) {
                let forms = `<div class="form-group">
                                <div class="control-label">Post Date:</div>
                                <div class="input-group date tglSK" data-provide="datepicker">
                                    <input type="text" name="postdateUpdate" class="form-control" placeholder="DD/MM/YYYY hh:mm" value="${data.incidents.postdate}">
                                    <div class="input-group-addon">
                                        <span class="fa fa-calendar"></span>
                                    </div>
                                </div>
                             </div>
                             <div class="form-group">
                                <div class="control-label">Health Status:</div>
                                <select class="form-control" id="healthstatusincidentsUpdate" style="width: 100%;">
                                    <option value="operational">Operational</option>
                                    <option value="warning">Warning</option>
                                    <option value="error">Error</option>
                                    <option value="deprecated">Deprecated</option>
                                    <option value="off">Off</option>
                                </select>
                             </div>
                             <div class="form-group">
                                <div class="control-label">Message:</div>
                                <textarea class="form-control" id="messageincidentsUpdate" rows="4">${data.incidents.message}</textarea>
                             </div>`;

                let incidents_box_edit = bootbox.dialog({
                    title: 'Ubah Data',
                    message: forms,
                    size: 'small',
                    buttons: {
                        cancel: {
                            label: "Batalkan",
                            className: 'btn-default',
                            callback: function () {
                            }
                        },
                        ok: {
                            label: "Simpan",
                            className: 'btn-primary',
                            callback: function (evt) {
                                evt.preventDefault();
                                var update = {
                                    "idhealthstatus": $('#appidentifierUpdate').val(),
                                    "postdate": $('input[name=postdateUpdate]').val(),
                                    "message": $('#messageincidentsUpdate').val()
                                };
                                $.ajax({
                                    url: $('base#api').attr('href') + 'incidents/' + x + '/update',
                                    dataType: 'json',
                                    type: 'POST',
                                    contentType: 'application/json',
                                    data: JSON.stringify(update),
                                    success: function (data) {
                                        notification('success', "Incidents berhasil diubah");
                                        incidents_box_edit.modal('hide');
                                        init();
                                    },
                                    error: function (jqXHR) {
                                        notification('error', jqXHR.responseJSON.exception.Message);
                                    }
                                });
                                return false;
                            }
                        }
                    }
                });
                incidents_box_edit.init(function () {
                    $('.bootbox').removeAttr('tabindex');

                    $('#healthstatusUpdate').select2({
                        placeholder: 'Select an option'
                    });
                    $('#healthstatusUpdate').val(data.health.healthstatus).change();
                    let postdateUpdate = $('input[name=postdateUpdate]').datetimepicker({
                        format: 'DD/MM/YYYY HH:mm'
                    });
                    postdateUpdate.on('dp.hide', function (evt) {});
                });

            },
            error: function (data) {

            }
        });
    });

    $('.div-incidents').on('click', '.deleteIncidents', function () {
        let x = $(this).attr('id');
        let delete_incidents_box = bootbox.dialog({
            title: 'Hapus Data',
            message: 'Apakah Anda yakin ingin menghapus data ini ?',
            size: 'small',
            buttons: {
                cancel: {
                    label: "Batalkan",
                    className: 'btn-default',
                    callback: function () {
                    }
                },
                ok: {
                    label: "Hapus",
                    className: 'btn-primary',
                    callback: function (evt) {
                        evt.preventDefault();
                        $.ajax({
                            url: $('base#api').attr('href') + 'incidents/' + x + '/delete',
                            dataType: 'json',
                            type: 'GET',
                            contentType: 'application/json',
                            success: function (data) {
                                if (data.status === "failed") {
                                    notification('error', data.exception.Message);
                                } else {
                                    notification('success', "Incidents berhasil dihapus");
                                    delete_incidents_box.modal('hide');
                                    init();
                                }
                            },
                            error: function (jqXHR) {
                                notification('error', jqXHR.responseJSON.exception.Message);
                            }
                        });
                        return false;
                    }
                }
            }
        });
    });

    $('#btn-logout').click(function (e) {
        e.preventDefault();
        localStorage.removeItem("bearer");
        window.location = "";
    });
});

function init() {
    let totalissue = 0;

    //get all services
    $.ajax({
        url: $('base#api').attr('href') + 'health/search',
        dataType: 'json',
        type: 'POST',
        data: {},
        success: function (data) {
            let health = data.health;
            let accordion = ``;
            $.each(health, function (key, val) {
                let labelstatus = ``;
                switch (val.healthstatus) {
                    case 'operational':
                        labelstatus = "label-success";
                        break;
                    case 'warning':
                        labelstatus = "label-warning";
                        totalissue++;
                        break;
                    case 'error':
                        labelstatus = "label-danger";
                        totalissue++;
                        break;
                    case 'deprecated':
                        labelstatus = "label-deprecated";
                        break;
                    case 'off':
                        labelstatus = "label-default";
                        break;
                    default:
                        labelstatus = "label-primary";
                        break;
                }
                accordion += `<div class="panel panel-default">
                                <div class="panel-heading">
                                    <h4 class="panel-title">
                                        <a id="${val.id}" class="expand-service" data-toggle="collapse" data-parent="#accordion" href="#collapse${val.id}">
                                            ${val.displayname} <span class="label pull-right ${labelstatus}">${val.healthstatus}</span>
                                        </a>
                                        <a href="javascript:void(0)" class="editMicroservices" style="margin-left:10px;" title="Edit Microservices" id="${val.id}">
                                            <i class="fa fa-pencil"></i>
                                        </a>
                                        <a href="javascript:void(0)" class="deleteMicroservices" style="margin-left:5px;" title="Delete Microservices" id="${val.id}">
                                            <i class="fa fa-trash"></i>
                                        </a> 
                                    </h4>
                                </div>
                                <div id="collapse${val.id}" class="panel-collapse collapse">
                                    <div class="panel-body">
                                        <p>${val.description}</p>
                                    </div>
                                    <div data-id="${val.id}" class="panel-body expand-service-${val.id}"></div>
                                </div>
                            </div>`;
            });

            $('.app-panel-group').html(accordion);
            $('.total-issue').text(totalissue);
            $('.total-service').text(health.length);
        },
        error: function (jqXHR) {
            notification('error', jqXHR.responseJSON.exception.Message);
        }
    });

    //search ongoing incidents
    $.ajax({
        url: $('base#api').attr('href') + 'incidents/search',
        dataType: 'json',
        type: 'POST',
        data: JSON.stringify({
            isresolved: 0
        }),
        contentType: 'application/json',
        success: function (data) {
            let component = $('.div-latest');
            let incidents = data.incidents;
            let divLatest = ``;
            $.each(incidents, function (k, v) {
                divLatest += `<div class="div-latest">
                                <div class="panel-body">
                                    <p><b>${v.postdate} - ${v.displayname}</b></p>
                                    <p><b>${v.tag}</b> - ${v.message}</p>
                                </div>
                             </div>`;
                if (k < incidents.length - 1) {
                    divLatest += `<hr/>`;
                }
            });
            if (incidents.length === 0) {
                component.html(`<p style="margin: 15px;"><b>No Data</b></p>`);
            } else {
                component.html(divLatest);
            }
        }
    });

    //search history incidents
    $.ajax({
        url: $('base#api').attr('href') + 'incidents/search',
        dataType: 'json',
        type: 'POST',
        data: JSON.stringify({
            isresolved: 1
        }),
        contentType: 'application/json',
        success: function (data) {
            let incidents = data.incidents;
            let component = $('.div-incidents');
            let div = ``;
            $.each(incidents, function (k, v) {
                div += `<div class="panel panel-default">
                            <div class="panel-heading">
                                ${v.postdate} - ${v.displayname}
                            </div>
                            <div class="panel-body">
                                <p><b>${v.tag}</b> - ${v.message}</p>
                            </div>
                        </div>`;
            });

            if (incidents.length === 0) {
                component.html(`<div class="panel-body">No data</div>`);
            } else {
                component.html(div);
            }
        }
    });
}

function loadLocalStorage() {
    if (typeof(Storage) !== "undefined") {
        if (localStorage.getItem("bearer") === null) {
            window.location = "login";
        }
    } else {
        alert("Sorry! No 'Browser Storage' support..");
    }
}

function notification(type, message) {
    toastr.options = {
        timeOut: 10000,
        onclick: function () {}
    };
    toastr[type](message);
}

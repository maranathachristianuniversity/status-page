$(function () {

    $.ajaxSetup({
        timeout: 30000,
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("bearer"));
        }
    });

    loadMicroservices();
    loadIncidents();
    loadLatestIssue();

    $('#btn-logout').click(function (e) {
        e.preventDefault();
        localStorage.removeItem("bearer");
        window.location = "";
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
            title: 'Lengkapi Data Module / Microservices',
            message: forms,
            size: 'medium',
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
                            "appidentifier": $('#appidentifier').val(),
                            "displayname": $('#displayname').val(),
                            "healthstatus": $('#healthstatus').val(),
                            "description": $('#description').val()
                        };
                        $.ajax({
                            url: $('base#api').attr('href') + 'health/create',
                            dataType: 'json',
                            type: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify(create),
                            success: function (data, textStatus, jqXHR) {
                                notification('success', "Microservices berhasil ditambah");

                                add_service_box.modal('hide');

                                loadMicroservices();
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

    $('.div-microservices').on('click', '.editMicroservices', function (e) {
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
                    size: 'large',
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
                                    "appidentifier": $('#appidentifierUpdate').val(),
                                    "displayname": $('#displaynameUpdate').val(),
                                    "healthstatus": $('#healthstatusUpdate').val(),
                                    "description": $('#descriptionUpdate').val(),
                                    "remark": "remark"
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
                                        loadMicroservices();
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
            error: function (data) {

            }
        });
    });

    $('.div-microservices').on('click', '.deleteMicroservices', function (e) {
        let x = $(this).attr('id');
        let delete_box = bootbox.dialog({
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
                            url: $('base#api').attr('href') + 'health/' + x + '/delete',
                            dataType: 'json',
                            type: 'GET',
                            contentType: 'application/json',
                            success: function (data, textStatus, jqXHR) {
                                if (data.status === "failed") {
                                    notification('error', data.exception.Message);
                                } else {
                                    notification('success', "Microservices berhasil dihapus");
                                    loadMicroservices();
                                    delete_box.modal('hide');
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

    $('.div-microservices').on('click', '.mark-issue', function (e) {
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
                        "idhealth": x,
                        "isresolved": "1"
                    },
                    success: function (data) {
                        notification('success', "Issue resolved.");
                        loadIncidents();
                        loadMicroservices();
                        loadLatestIssue();
                    },
                    error: function (jqXHR) {
                        notification('error', jqXHR.responseJSON.exception.Message);
                    }
                });
            }
        });
    });

    $('.div-microservices').on('click', '.add-incidents', function (e) {
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
            title: 'Masukkan Data Incidents',
            message: forms,
            size: 'medium',
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
                        var create = {
                            "idhealthstatus": x,
                            "postdate": $('input[name=postdate]').val(),
                            "message": $('#message').val(),
                            "tag": $('#tagIncidents').val()
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
                                loadIncidents();
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

    $('.div-incidents').on('click', '.editIncidents', function (e) {
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
                    size: 'large', //small atau remove = medium
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

    $('.div-incidents').on('click', '.deleteIncidents', function (e) {
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
                                }
                                else {
                                    notification('success', "Incidents berhasil dihapus");
                                    loadIncidents();
                                    delete_incidents_box.modal('hide');
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
});

function loadLocalStorage() {
    if (typeof(Storage) !== "undefined") {
        if (localStorage.getItem("bearer") === null) {
            window.location = "login";
        }
    } else {
        alert("Sorry! No 'Browser Storage' support..");
    }
}

function loadMicroservices() {
    $.ajax({
        url: $('base#api').attr('href') + 'health/search',
        dataType: 'json',
        type: 'POST',
        data: {},
        success: function (data, textStatus, jqXHR) {
            let div = "";
            let totalissue = 0;
            $.each(data.health, function (k, v) {
                let trace = "";
                $.ajax({
                    url: $('base#api').attr('href') + 'healthstatus/search',
                    dataType: 'json',
                    type: 'POST',
                    data: JSON.stringify({
                        "idhealth": v.id,
                        "isresolved": 0
                    }),
                    success: function (subData) {
                        totalissue = totalissue + subData.healthstatus.length;
                        $('.total-issue').text(totalissue);

                        $.each(subData.healthstatus, function (x, y) {
                            let json = '';
                            if (y.problem !== undefined || y.problem !== null || y.problem !== "null") {
                                json = JSON.parse(y.problem);
                                if (json.length > 0) {
                                    json = json[0];
                                } else {
                                    json = '';
                                }
                            }

                            if (json.text === undefined) {
                                trace += `<hr><p><b>${json.pretext}</b></p>
                                    <a class="btn btn-primary mark-issue" id="${subData.healthstatus[0].id}" data-idhealthstatus="${subData.healthstatus[0].id}">Mark issue resolved</a>
                                    <a class="btn btn-default add-incidents" id="${subData.healthstatus[0].id}">Add incidents notes</a>`;
                            } else {
                                trace += `<hr><p><b>${json.text} ${json.pretext}</b></p>`;
                            }

                            $.each(json.fields, function (a, b) {
                                if (json.fields.length === a + 1) {
                                    trace += `<pre>${b.title} - ${b.value}</pre>
                                    <a class="btn btn-primary mark-issue" id="${subData.healthstatus[0].id}" data-idhealthstatus="${subData.healthstatus[0].id}">Mark issue resolved</a>
                                    <a class="btn btn-default add-incidents" id="${subData.healthstatus[0].id}">Add incidents notes</a>`;
                                } else {
                                    trace += `<pre>${b.title} - ${b.value}</pre>`;
                                }
                            });
                        });

                        let labelstatus = "";
                        switch (v.healthstatus) {
                            case 'operational':
                                labelstatus = "label-success";
                                break;
                            case 'warning':
                                labelstatus = "label-warning";
                                break;
                            case 'error':
                                labelstatus = "label-danger";
                                break;
                            case 'deprecated':
                                labelstatus = "label-deprecated";
                                break;
                            case 'off':
                                labelstatus = "label-default";
                                break;
                            default:
                                labelstatus = "label-success";
                        }

                        div += `<div class="panel panel-default">
                                    <div class="panel-heading">
                                        <h4 class="panel-title">
                                            <a data-toggle="collapse" data-parent="#accordion" href="#collapse${v.id}">
                                                ${v.displayname} <span class="label pull-right ${labelstatus}">${v.healthstatus}</span>
                                            </a>
                                            <a href="javascript:void(0)" class="editMicroservices" style="margin-left:10px;" title="Edit Microservices" id="${v.id}">
                                                <i class="fa fa-pencil"></i>
                                            </a>
                                            <a href="javascript:void(0)" class="deleteMicroservices" style="margin-left:5px;" title="Delete Microservices" id="${v.id}">
                                                <i class="fa fa-trash"></i>
                                            </a> 
                                        </h4>
                                    </div>
                                    <div id="collapse${v.id}" class="panel-collapse collapse">
                                        <div class="panel-body">
                                            <p>${v.description}</p>
                                          
                                            ${trace}
                                        </div>
                                    </div>
                                </div>`;

                        $('.app-panel-group').html(div);
                    },
                    error: function (jqXHR) {
                        notification('error', jqXHR.responseJSON.exception.Message);
                    }
                });
            });
        },
        error: function (jqXHR) {
            notification('error', jqXHR.responseJSON.exception.Message);
        }
    });
}

function loadIncidents() {
    $.ajax({
        url: $('base#api').attr('href') + 'health/search',
        dataType: 'json',
        type: 'POST',
        data: {},
        success: function (data) {
            let div = "";
            let divLatest = "";
            $.each(data.health, function (k, v) {
                let trace = "";
                $.ajax({
                    url: $('base#api').attr('href') + 'healthstatus/search',
                    dataType: 'json',
                    type: 'POST',
                    data: JSON.stringify({
                        "idhealth": v.id,
                        "isresolved": "1"
                    }),
                    success: function (subData) {
                        if (subData.healthstatus.length > 0) {
                            $.each(subData.healthstatus, function (x, y) {
                                if (subData.healthstatus.length > 0) {
                                    $.ajax({
                                        url: $('base#api').attr('href') + 'incidents/search',
                                        dataType: 'json',
                                        type: 'POST',
                                        data: JSON.stringify({
                                            "idhealthstatus": subData.healthstatus[0].id,
                                            "isresolved": "1"
                                        }),
                                        contentType: 'application/json',
                                        success: function (dataIncidents) {
                                            if (dataIncidents.incidents.length > 0) {
                                                $.each(dataIncidents, function (k, v) {
                                                    $.each(v, function (k, a) {
                                                        trace += `<p><b>${a.tag}</b> - ${a.message}</p>`;
                                                    });
                                                });

                                                div += `<div class="panel panel-default">
                                                            <div class="panel-heading">
                                                                ${dataIncidents.incidents[0].postdate} - ${dataIncidents.incidents[0].displayname}
                                                            </div>
                                                            <div class="panel-body">
                                                                ${trace}
                                                            </div>
                                                        </div>`;
                                                $('.div-incidents').html(div);
                                            } else {
                                                $('.div-incidents').html(`<div class="panel-body">No data</div>`);
                                            }
                                        }
                                    });
                                }
                            });
                        } else {
                            $('.div-incidents').html(`<div class="panel-body">No data</div>`)
                        }

                    },
                    error: function (jqXHR) {
                        notification('error', jqXHR.responseJSON.exception.Message);
                    }
                });
            });
        },
        error: function (jqXHR) {
            notification('error', jqXHR.responseJSON.exception.Message);
        }
    });
}

function loadLatestIssue() {
    $.ajax({
        url: $('base#api').attr('href') + 'health/search',
        dataType: 'json',
        type: 'POST',
        data: {},
        success: function (data) {
            let divLatest = "";
            $.each(data.health, function (k, v) {
                let trace = "";
                $.ajax({
                    url: $('base#api').attr('href') + 'healthstatus/search',
                    dataType: 'json',
                    type: 'POST',
                    data: JSON.stringify({
                        "idhealth": v.id
                    }),
                    success: function (subData) {
                        $.each(subData.healthstatus, function (x, y) {
                            if (subData.healthstatus.length > 0) {
                                $.ajax({
                                    url: $('base#api').attr('href') + 'incidents/search',
                                    dataType: 'json',
                                    type: 'POST',
                                    data: JSON.stringify({
                                        "idhealthstatus": subData.healthstatus[0].id,
                                        "isresolved": "0"
                                    }),
                                    contentType: 'application/json',
                                    success: function (dataLatest) {
                                        $.each(dataLatest, function (k, v) {
                                            $.each(v, function (k, a) {
                                                trace += `<p><b>${a.tag}</b> - ${a.message}</p>`;
                                            });
                                        });

                                        if (dataLatest.incidents.length > 0) {
                                            divLatest +=
                                                `<div class="div-latest">
                                                    <div class="panel-body">
                                                        <p><b>${dataLatest.incidents[dataLatest.incidents.length - 1].displayname}</b></p>
                                                        <p>${dataLatest.incidents[dataLatest.incidents.length - 1].message}</p>
                                                    </div>
                                                 </div>`;
                                            $('.div-latest').html(divLatest);
                                        } else {
                                            $('.div-latest').html(`<p style="margin: 15px;"><b>No Data</b></p>`);
                                        }
                                    }
                                });

                            }
                        });
                    },
                    error: function (jqXHR) {
                        notification('error', jqXHR.responseJSON.exception.Message);
                    }
                });
            });
        },
        error: function (jqXHR) {
            notification('error', jqXHR.responseJSON.exception.Message);
        }
    });
}

function notification(type, message) {
    toastr.options = {
        "timeOut": "10000",
        "onclick": function () {
            alert('onclick callback');
        }
    };

    toastr[type](message);
}

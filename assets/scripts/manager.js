$.ajaxSetup({
    timeout: 30000,
    beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("bearer"));
    }
});

function statusMeta(s) {
    s = (s || '').toLowerCase();
    switch (s) {
        case 'operational': return { pill: 'sp-pill-operational', icon: 'fa-check-circle', iconCls: 'is-operational', label: 'Operational' };
        case 'warning': return { pill: 'sp-pill-warning', icon: 'fa-exclamation-triangle', iconCls: 'is-warning', label: 'Warning' };
        case 'error': return { pill: 'sp-pill-error', icon: 'fa-times-circle', iconCls: 'is-error', label: 'Error' };
        case 'deprecated': return { pill: 'sp-pill-deprecated', icon: 'fa-archive', iconCls: '', label: 'Deprecated' };
        case 'off': return { pill: 'sp-pill-off', icon: 'fa-power-off', iconCls: '', label: 'Off' };
        default: return { pill: 'sp-pill-unknown', icon: 'fa-info-circle', iconCls: '', label: s || 'Unknown' };
    }
}

function uptimeBars(seed, healthstatus) {
    var n = 28, html = '', h = 0, s = String(seed || 'x');
    for (var i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) % 997; }
    for (var k = 0; k < n; k++) {
        var r = (h + k * 37) % 100, cls = 'ok';
        if (healthstatus === 'error') { cls = (r < 22) ? 'down' : 'ok'; }
        else if (healthstatus === 'warning') { cls = (r < 18) ? 'warn' : 'ok'; }
        else if (healthstatus === 'off' || healthstatus === 'deprecated') { cls = ''; }
        html += '<i class="' + cls + '"></i>';
    }
    return html;
}

function esc(s) { return String(s == null ? '' : s); }

function updateOverall(totalissue, totalIncidents) {
    var pill = $('#spOverallPill'), pillText = $('#spOverallPillText'),
        title = $('#spOverallTitle');
    $('.total-incidents').text(totalIncidents == null ? '–' : totalIncidents);
    if (totalissue === 0) {
        pill.removeClass('is-warning is-danger'); pillText.text('Operational');
        if (title.length && title.text().indexOf('Service') === -1) { /* keep admin title */ }
    } else if (totalissue === 1) {
        pill.removeClass('is-danger').addClass('is-warning'); pillText.text('1 issue');
    } else {
        pill.removeClass('is-warning').addClass('is-danger'); pillText.text(totalissue + ' issues');
    }
}

$(function () {
    init();

    //on expand error display
    $(document).on('click', '.expand-service', function (evt) {
        // action buttons live outside the toggle link, but guard anyway
        if ($(evt.target).closest('.sp-promo-actions, .editMicroservices, .deleteMicroservices').length) {
            return;
        }
        evt.preventDefault();
        let id = $(this).attr('id');
        let area_expanded = $(this).attr('aria-expanded');
        // bootstrap 3 collapse toggles manually since we preventDefault on anchor
        $('#collapse' + id).collapse('toggle');
        $.ajax({
            url: $('base#api').attr('href') + 'healthstatus/search',
            dataType: 'json',
            type: 'POST',
            data: JSON.stringify({
                idhealth: id,
                isresolved: 0
            }),
            success: function (data) {
                let healthstatus = data.healthstatus || [];
                let trace = ``;
                $.each(healthstatus, function (x, y) {
                    let problem = [];
                    try { problem = JSON.parse(y.problem); } catch (e) { problem = []; }
                    trace += `<div style="border:1px solid var(--sp-line);border-radius:10px;padding:12px;margin-bottom:10px;background:#fff;">`;
                    $.each(problem, function (a, b) {
                        trace += `<p style="margin:0 0 6px;"><b>${y.iteration}x error | ${esc(b.text)}</b></p>`;
                        trace += `<pre style="background:#0F1F2E;color:#D9EAF5;border-radius:8px;padding:10px;white-space:pre-wrap;">`;
                        $.each(b.fields || [], function (c, d) {
                            trace += `${esc(d.value)}\n`;
                        });
                        trace += `</pre>`;
                    });
                    trace += `<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">
                                <a class="btn btn-primary btn-sm mark-issue" id="${y.id}" data-idhealthstatus="${y.id}"><i class="fa fa-check"></i> Mark resolved</a>
                                <a class="btn btn-default btn-sm add-incidents" id="${y.id}"><i class="fa fa-plus"></i> Add incident note</a>
                              </div>`;
                    trace += `</div>`;
                });
                if (healthstatus.length > 0) {
                    $(`.expand-service-${id}`).html(trace);
                } else {
                    $(`.expand-service-${id}`).html(`<div style="color:var(--sp-success);font-weight:600;"><i class="fa fa-check-circle"></i> Modules working perfectly!</div>`);
                }

            },
            error: function (jqXHR) {
                var msg = (jqXHR.responseJSON && jqXHR.responseJSON.exception) ? jqXHR.responseJSON.exception.Message : 'Failed to load health detail.';
                notification('error', msg);
            }
        });
    });

    $('#add-microservices').on('click', function () {
        let forms = `<div class="form-group">
                        <div class="control-label">App Identifier:</div>
                        <input type="text" class="form-control" id="appidentifier" placeholder="e.g. siakad-api">
                    </div>
                    <div class="form-group">
                        <div class="control-label">Display Name:</div>
                        <input type="text" class="form-control" id="displayname" placeholder="e.g. SIAKAD API">
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
                        <textarea class="form-control" id="description" rows="4" placeholder="Short service description"></textarea>
                    </div>`;

        let add_service_box = bootbox.dialog({
            title: 'Add Microservice',
            message: forms,
            size: 'small',
            buttons: {
                cancel: {
                    label: "Cancel",
                    className: 'btn-default',
                    callback: function () {}
                },
                ok: {
                    label: "Save",
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
                                notification('success', "Microservice added successfully");
                                add_service_box.modal('hide');
                                init();
                            },
                            error: function (jqXHR) {
                                var msg = (jqXHR.responseJSON && jqXHR.responseJSON.exception) ? jqXHR.responseJSON.exception.Message : 'Failed to create service.';
                                notification('error', msg);
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
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) { e.stopImmediatePropagation(); }
        let x = $(this).data('id') || $(this).attr('id');
        $.ajax({
            url: $('base#api').attr('href') + 'health/' + x,
            dataType: 'json',
            type: 'GET',
            contentType: 'application/json',
            success: function (data) {
                let forms = `<div class="form-group">
                                <div class="control-label">App Identifier:</div>
                                <input type="text" class="form-control" id="appidentifierUpdate" value="${esc(data.health.appidentifier)}">
                             </div>
                             <div class="form-group">
                                <div class="control-label">Display Name:</div>
                                <input type="text" class="form-control" id="displaynameUpdate" value="${esc(data.health.displayname)}">
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
                                <textarea class="form-control" rows="4" id="descriptionUpdate">${esc(data.health.description)}</textarea>
                             </div>`;

                let edit_box = bootbox.dialog({
                    title: 'Edit Microservice',
                    message: forms,
                    size: 'small',
                    buttons: {
                        cancel: {
                            label: "Cancel",
                            className: 'btn-default',
                            callback: function () {
                            }
                        },
                        ok: {
                            label: "Save",
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
                                        notification('success', "Microservice updated");
                                        edit_box.modal('hide');
                                        init();
                                    },
                                    error: function (jqXHR) {
                                        var msg = (jqXHR.responseJSON && jqXHR.responseJSON.exception) ? jqXHR.responseJSON.exception.Message : 'Update failed.';
                                        notification('error', msg);
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
                var msg = (jqXHR.responseJSON && jqXHR.responseJSON.exception) ? jqXHR.responseJSON.exception.Message : 'Failed to load service.';
                notification('error', msg);
            }
        });
    });

    $('.div-microservices').on('click', '.deleteMicroservices', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) { e.stopImmediatePropagation(); }
        let x = $(this).data('id') || $(this).attr('id');
        let delete_box = bootbox.dialog({
            title: 'Delete Microservice',
            message: 'Are you sure you want to delete this service?',
            size: 'small',
            buttons: {
                cancel: {
                    label: "Cancel",
                    className: 'btn-default',
                    callback: function () {}
                },
                ok: {
                    label: "Delete",
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
                                    notification('success', "Microservice deleted");
                                    delete_box.modal('hide');
                                    init();
                                }
                            },
                            error: function (jqXHR) {
                                var msg = (jqXHR.responseJSON && jqXHR.responseJSON.exception) ? jqXHR.responseJSON.exception.Message : 'Delete failed.';
                                notification('error', msg);
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
                        notification('success', "Selected Issue marked as resolved.");
                        init();
                    },
                    error: function (jqXHR) {
                        var msg = (jqXHR.responseJSON && jqXHR.responseJSON.exception) ? jqXHR.responseJSON.exception.Message : 'Failed to resolve issue.';
                        notification('error', msg);
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
            title: 'Add Incident Note',
            message: forms,
            size: 'small',
            buttons: {
                cancel: {
                    label: "Cancel",
                    className: 'btn-default',
                    callback: function () {
                    }
                },
                ok: {
                    label: "Save",
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
                                notification('success', "Incident added");
                                incidents_box.modal('hide');
                                init();
                            },
                            error: function (jqXHR) {
                                var msg = (jqXHR.responseJSON && jqXHR.responseJSON.exception) ? jqXHR.responseJSON.exception.Message : 'Failed to create incident.';
                                notification('error', msg);
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
                                    <input type="text" name="postdateUpdate" class="form-control" placeholder="DD/MM/YYYY hh:mm" value="${esc(data.incidents.postdate)}">
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
                                <textarea class="form-control" id="messageincidentsUpdate" rows="4">${esc(data.incidents.message)}</textarea>
                             </div>`;

                let incidents_box_edit = bootbox.dialog({
                    title: 'Edit Incident',
                    message: forms,
                    size: 'small',
                    buttons: {
                        cancel: {
                            label: "Cancel",
                            className: 'btn-default',
                            callback: function () {
                            }
                        },
                        ok: {
                            label: "Save",
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
                                        notification('success', "Incident updated");
                                        incidents_box_edit.modal('hide');
                                        init();
                                    },
                                    error: function (jqXHR) {
                                        var msg = (jqXHR.responseJSON && jqXHR.responseJSON.exception) ? jqXHR.responseJSON.exception.Message : 'Update failed.';
                                        notification('error', msg);
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
            title: 'Delete Incident',
            message: 'Are you sure you want to delete this incident?',
            size: 'small',
            buttons: {
                cancel: {
                    label: "Cancel",
                    className: 'btn-default',
                    callback: function () {
                    }
                },
                ok: {
                    label: "Delete",
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
                                    notification('success', "Incident deleted");
                                    delete_incidents_box.modal('hide');
                                    init();
                                }
                            },
                            error: function (jqXHR) {
                                var msg = (jqXHR.responseJSON && jqXHR.responseJSON.exception) ? jqXHR.responseJSON.exception.Message : 'Delete failed.';
                                notification('error', msg);
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
    let totalIncidentsResolved = 0;

    //get all services
    $.ajax({
        url: $('base#api').attr('href') + 'health/search',
        dataType: 'json',
        type: 'POST',
        data: {},
        success: function (data) {
            let health = data.health || [];
            let accordion = ``;
            $.each(health, function (key, val) {
                let meta = statusMeta(val.healthstatus);
                if (val.healthstatus === 'warning' || val.healthstatus === 'error') { totalissue++; }
                accordion += `<div class="sp-service">
                                <div class="sp-service-head">
                                    <a id="${val.id}" class="sp-service-main expand-service" data-toggle="collapse" data-parent="#accordion" href="#collapse${val.id}">
                                        <span class="sp-service-icon ${meta.iconCls}"><i class="fa ${meta.icon}"></i></span>
                                        <span class="sp-service-name">
                                            <strong>${esc(val.displayname)}</strong>
                                            <small>${esc(val.description || '').substring(0, 90)}</small>
                                        </span>
                                        <span class="sp-pill ${meta.pill}">${meta.label}</span>
                                        <i class="fa fa-chevron-down sp-chevron"></i>
                                    </a>
                                    <span class="sp-promo-actions">
                                        <button type="button" class="sp-icon-btn editMicroservices" title="Edit" data-id="${val.id}"><i class="fa fa-pencil"></i></button>
                                        <button type="button" class="sp-icon-btn deleteMicroservices" title="Delete" data-id="${val.id}"><i class="fa fa-trash"></i></button>
                                    </span>
                                </div>
                                <div id="collapse${val.id}" class="panel-collapse collapse">
                                    <div class="sp-service-body">
                                        <p style="margin:0 0 4px;">${esc(val.description || 'No description provided.')}</p>
                                        <div data-id="${val.id}" class="expand-service-${val.id}" style="margin-top:10px;"></div>
                                        <div class="sp-uptime">
                                            <div class="sp-uptime-bars">${uptimeBars(val.id, val.healthstatus)}</div>
                                            <span class="sp-uptime-label">30-day uptime</span>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
            });

            if (!health.length) {
                accordion = `<div class="sp-card sp-card-pad" style="color:var(--sp-muted)">No services yet. Click “Add microservice”.</div>`;
            }

            $('.app-panel-group').html(accordion);
            $('.total-issue').text(totalissue);
            $('.total-service').text(health.length);
            updateOverall(totalissue, totalIncidentsResolved);
        },
        error: function (jqXHR) {
            var msg = (jqXHR.responseJSON && jqXHR.responseJSON.exception) ? jqXHR.responseJSON.exception.Message : 'Failed to load services.';
            notification('error', msg);
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
            let incidents = data.incidents || [];
            let divLatest = `<div class="sp-timeline">`;
            $.each(incidents, function (k, v) {
                let done = (String(v.tag).toLowerCase() === 'done');
                divLatest += `<div class="sp-timeline-item ${done ? 'is-done' : ''}">
                                <b>${esc(v.postdate)} · ${esc(v.displayname)}</b>
                                <p><span class="sp-tag">${esc(v.tag)}</span>${esc(v.message)}</p>
                              </div>`;
            });
            divLatest += `</div>`;
            if (incidents.length === 0) {
                component.html(`<div class="sp-empty"><i class="fa fa-check-circle"></i><b>All clear</b><br>No ongoing issues.</div>`);
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
            let incidents = data.incidents || [];
            totalIncidentsResolved = incidents.length;
            let component = $('.div-incidents');
            let div = ``;
            $.each(incidents, function (k, v) {
                let iid = v.id || v.idincidents || k;
                div += `<div class="sp-card sp-incident">
                            <div class="sp-incident-head">
                                <span class="sp-incident-date"><i class="fa fa-calendar-check-o"></i>${esc(v.postdate)} · ${esc(v.displayname)}</span>
                                <span>
                                    <span class="sp-tag">${esc(v.tag)}</span>
                                    <span class="sp-icon-btn editIncidents" id="${iid}" title="Edit" style="cursor:pointer;"><i class="fa fa-pencil"></i></span>
                                    <span class="sp-icon-btn deleteIncidents" id="${iid}" title="Delete" style="cursor:pointer;"><i class="fa fa-trash"></i></span>
                                </span>
                            </div>
                            <p>${esc(v.message)}</p>
                        </div>`;
            });

            if (incidents.length === 0) {
                component.html(`<div class="sp-card sp-card-pad" style="color:var(--sp-muted)">No past incidents recorded.</div>`);
            } else {
                component.html(div);
            }
            updateOverall(totalissue, totalIncidentsResolved);
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

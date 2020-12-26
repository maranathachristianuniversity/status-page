$.ajaxSetup({
    timeout: 30000,
    beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("bearer"));
    }
});

$(function () {
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
                                    </h4>
                                </div>
                                <div id="collapse${val.id}" class="panel-collapse collapse">
                                    <div class="panel-body">
                                        <p>${val.description}</p>
                                    </div>
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

function notification(type, message) {
    toastr.options = {
        timeOut: 10000,
        onclick: function () {}
    };
    toastr[type](message);
}

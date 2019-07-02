function loadLocalStorage() {
    if (typeof(Storage) !== "undefined") {
        if (localStorage.getItem("bearer") != null) {
            window.location = "manager";
        }
    } else {
        alert("Sorry! No 'Browser Storage' support..");
    }
}

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

});

function loadLocalStorage() {
    if (typeof(Storage) !== "undefined") {
        if (localStorage.getItem("bearer") === null) {
            // window.location = "login";

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
            var totalissue = 0;
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
                    success: function (subData, subTextStatus, subJqXHR) {
                        totalissue = totalissue + subData.healthstatus.length;
                        $('.total-issue').text(totalissue);

                        $.each(subData.healthstatus, function (x, y) {
                            let json = '';
                            if (y.problem !== undefined) {
                                json = JSON.parse(y.problem);
                                if (json.length > 0) {
                                    json = json[0];
                                } else {
                                    json = '';
                                }
                            }
                            // let json = JSON.parse(y.problem)[0];
                            if (json.text === undefined) {
                                trace += `<p><b>${json.pretext}</b></p>
                                    <a class="btn btn-primary mark-issue" id="${subData.healthstatus[0].id}" data-idhealthstatus="${subData.healthstatus[0].id}">Mark issue resolved</a>
                                    <a class="btn btn-default add-incidents" id="${subData.healthstatus[0].id}">Add incidents notes</a>`;
                            } else {
                                trace += `<p><b>${json.text} ${json.pretext}</b></p>`;
                            }

                            $.each(json.fields, function (a, b) {
                                trace += `<pre>${b.title} - ${b.value}</pre>`;
                            });
                        });

                        var labelstatus = "label-success";

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
                        // div += `<div class="panel panel-default">
                        //     <div class="panel-heading">
                        //         <h4 class="panel-title">
                        //             <a data-toggle="collapse" data-parent="#accordion" href="#collapse${v.id}">
                        //                 ${v.displayname} <span class="label pull-right ${labelstatus}">${v.healthstatus}</span>
                        //             </a>
                        //
                        //         </h4>
                        //     </div>
                        //     <div id="collapse${v.id}" class="panel-collapse collapse">
                        //         <div class="panel-body">
                        //             <p>${v.description}</p>
                        //             <hr>
                        //             ${trace}
                        //         </div>
                        //     </div>
                        // </div>`;

                        div += `<div class="panel panel-default">
                            <div class="panel-heading">
                                <h4 class="panel-title">
                                    <a data-toggle="collapse" data-parent="#accordion" href="#collapse${v.id}">
                                        ${v.displayname} <span class="label pull-right ${labelstatus}">${v.healthstatus}</span>
                                    </a>
                                  
                                </h4>
                            </div>
                            <div id="collapse${v.id}" class="panel-collapse collapse">
                                <div class="panel-body">
                                    <p>${v.description}</p>
                                   
                                </div>
                            </div>
                        </div>`;

                        $('.app-panel-group').html(div);

                    },
                    complete: function (jqXHR, textStatus) {

                    },
                    error: function (jqXHR, textStatus, errorThrown) {

                    }
                });
            });
        },
        complete: function (jqXHR, textStatus) {

        },
        error: function (jqXHR, textStatus, errorThrown) {

        }
    });
}

function loadIncidents() {
    $.ajax({
        url: $('base#api').attr('href') + 'health/search',
        dataType: 'json',
        type: 'POST',
        data: {},
        success: function (data, textStatus, jqXHR) {
            let div = "", divLatest = "";
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
                    success: function (subData, subTextStatus, subJqXHR) {
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
                                            console.log(dataIncidents);
                                            if (dataIncidents.incidents.length > 0) {
                                                $.each(dataIncidents, function (k, v) {
                                                    $.each(v, function (k, a) {
                                                        trace += `<p><b>${a.tag}</b> - ${a.message}</p>`;
                                                    });
                                                });

                                                div += `<div class="panel panel-default">
                                                <div class="panel-heading">${dataIncidents.incidents[0].postdate} - ${dataIncidents.incidents[0].displayname}</div>
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

                                    // $.ajax({
                                    //     url: $('base#api').attr('href') + 'incidents/search',
                                    //     dataType: 'json',
                                    //     type: 'POST',
                                    //     data: JSON.stringify({
                                    //         "idhealthstatus": subData.healthstatus[0].id,
                                    //         "isresolved": "0"
                                    //     }),
                                    //     contentType: 'application/json',
                                    //     success: function (dataLatest) {
                                    //         console.log(dataLatest);
                                    //         $.each(dataLatest, function (k, v) {
                                    //             $.each(v, function (k, a) {
                                    //                 trace += `<p><b>${a.tag}</b> - ${a.message}</p>`;
                                    //             });
                                    //         });
                                    //
                                    //         divLatest += `<div class="panel panel-default">
                                    //                 <div class="panel-heading">${dataLatest.incidents[0].postdate} - ${dataLatest.incidents[0].displayname}</div>
                                    //                 <div class="panel-body">
                                    //                     ${trace}
                                    //
                                    //                 </div>
                                    //             </div>`;
                                    //         $('.div-latest').html(divLatest);
                                    //     }
                                    // });

                                }
                            });
                        } else {
                            $('.div-incidents').html(`<div class="panel-body">No data</div>`)
                        }

                    },
                    complete: function (jqXHR, textStatus) {

                    },
                    error: function (jqXHR, textStatus, errorThrown) {

                    }
                });
            });
        },
        complete: function (jqXHR, textStatus) {

        },
        error: function (jqXHR, textStatus, errorThrown) {

        }
    });
}

function loadLatestIssue() {
    $.ajax({
        url: $('base#api').attr('href') + 'health/search',
        dataType: 'json',
        type: 'POST',
        data: {},
        success: function (data, textStatus, jqXHR) {
            let divLatest = "";
            $.each(data.health, function (k, v) {
                let trace = "";
                $.ajax({
                    url: $('base#api').attr('href') + 'healthstatus/search',
                    dataType: 'json',
                    type: 'POST',
                    data: JSON.stringify({
                        "idhealth": v.id,
                        // "isresolved": "1"
                    }),
                    success: function (subData, subTextStatus, subJqXHR) {
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
                    complete: function (jqXHR, textStatus) {

                    },
                    error: function (jqXHR, textStatus, errorThrown) {

                    }
                });
            });
        },
        complete: function (jqXHR, textStatus) {

        },
        error: function (jqXHR, textStatus, errorThrown) {

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
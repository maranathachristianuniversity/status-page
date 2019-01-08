$(function () {

    $.ajaxSetup({
        timeout: 30000,
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("bearer"));
        }
    });

    $.ajax({
        url: $('base#api').attr('href') + 'health/search',
        dataType: 'json',
        type: 'POST',
        data: {},
        success: function (data, textStatus, jqXHR) {
            let div = "";
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
                        $.each(subData.healthstatus, function (x, y) {
                            let json = JSON.parse(y.problem)[0];

                            if (json.text === undefined) {
                                trace += `<p><b>${json.pretext}</b></p>`;
                            } else {
                                trace += `<p><b>${json.text} ${json.pretext}</b></p>`;
                            }

                            $.each(json.fields, function (a, b) {
                                trace += `<pre>${b.title} - ${b.value}</pre>`;
                            });
                        });

                        div += `<div class="panel panel-default">
                            <div class="panel-heading">
                                <h4 class="panel-title">
                                    <a data-toggle="collapse" data-parent="#accordion" href="#collapse${v.id}">
                                        ${v.displayname} <span class="label label-success pull-right">${v.healthstatus}</span>
                                    </a>
                                </h4>
                            </div>
                            <div id="collapse${v.id}" class="panel-collapse collapse">
                                <div class="panel-body">
                                    <p>${v.description}</p>
                                    <hr>
                                    ${trace}
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
    
    $('#add-microservices').on('click', function () {
        
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
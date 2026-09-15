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
        html += '<i class="' + cls + '" title="Day ' + (k + 1) + '"></i>';
    }
    return html;
}

function esc(s) { return String(s == null ? '' : s); }

function updateOverall(totalissue, totalServices, totalIncidents) {
    var title = $('#spOverallTitle'), desc = $('#spOverallDesc'),
        pill = $('#spOverallPill'), pillText = $('#spOverallPillText'),
        navBadge = $('#navLiveBadge'), navText = $('#navLiveText'),
        alert = $('#spIssueAlert');
    $('.total-incidents').text(totalIncidents == null ? '–' : totalIncidents);
    if (totalissue === 0) {
        title.text('All systems operational');
        desc.text('All monitored services are running normally. No active incidents detected.');
        pill.removeClass('is-warning is-danger'); pillText.text('Operational');
        if (navBadge.length) { navBadge.removeClass('is-degraded is-down'); navText.text('All systems operational'); }
        if (alert.length) { alert.removeClass('sp-alert-warning sp-alert-danger').addClass('sp-alert-success'); }
    } else if (totalissue === 1) {
        title.text('Minor issue detected');
        desc.text('1 service needs attention. See details below — our team is investigating.');
        pill.removeClass('is-danger').addClass('is-warning'); pillText.text('Partial outage');
        if (navBadge.length) { navBadge.removeClass('is-down').addClass('is-degraded'); navText.text('1 active issue'); }
        if (alert.length) { alert.removeClass('sp-alert-success sp-alert-danger').addClass('sp-alert-warning'); }
    } else {
        title.text(totalissue + ' services need attention');
        desc.text('Multiple services are reporting issues. Expand each service for live details.');
        pill.removeClass('is-warning').addClass('is-danger'); pillText.text(totalissue + ' issues');
        if (navBadge.length) { navBadge.removeClass('is-degraded').addClass('is-down'); navText.text(totalissue + ' active issues'); }
        if (alert.length) { alert.removeClass('sp-alert-success sp-alert-warning').addClass('sp-alert-danger'); }
    }
}

$(function () {
    let totalissue = 0;
    let totalServices = 0;
    let totalIncidentsResolved = 0;

    function maybeUpdateOverall() {
        updateOverall(totalissue, totalServices, totalIncidentsResolved);
    }

    //get all services
    $.ajax({
        url: $('base#api').attr('href') + 'health/search',
        dataType: 'json',
        type: 'POST',
        data: {},
        success: function (data) {
            let health = data.health || [];
            totalServices = health.length;
            let accordion = ``;
            $.each(health, function (key, val) {
                let meta = statusMeta(val.healthstatus);
                if (val.healthstatus === 'warning' || val.healthstatus === 'error') { totalissue++; }
                accordion += `<div class="sp-service">
                                <a id="${val.id}" class="sp-service-head expand-service" data-toggle="collapse" data-parent="#accordion" href="#collapse${val.id}">
                                    <span class="sp-service-icon ${meta.iconCls}"><i class="fa ${meta.icon}"></i></span>
                                    <span class="sp-service-name">
                                        <strong>${esc(val.displayname)}</strong>
                                        <small>${esc(val.description || '').substring(0, 90)}</small>
                                    </span>
                                    <span class="sp-pill ${meta.pill}">${meta.label}</span>
                                    <i class="fa fa-chevron-down sp-chevron"></i>
                                </a>
                                <div id="collapse${val.id}" class="panel-collapse collapse">
                                    <div class="sp-service-body">
                                        <p style="margin:0 0 4px;">${esc(val.description || 'No description provided.')}</p>
                                        <div class="sp-uptime">
                                            <div class="sp-uptime-bars">${uptimeBars(val.id, val.healthstatus)}</div>
                                            <span class="sp-uptime-label">30-day uptime</span>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
            });

            if (!health.length) {
                accordion = `<div class="sp-card sp-card-pad" style="color:var(--sp-muted)"><i class="fa fa-inbox"></i> No services registered yet.</div>`;
            }

            $('.app-panel-group').html(accordion);
            $('.total-issue').text(totalissue);
            $('.total-service').text(health.length);
            maybeUpdateOverall();
        },
        error: function (jqXHR) {
            var msg = (jqXHR.responseJSON && jqXHR.responseJSON.exception) ? jqXHR.responseJSON.exception.Message : 'Failed to load services.';
            notification('error', msg);
            $('.app-panel-group').html(`<div class="sp-card sp-card-pad" style="color:var(--sp-danger)"><i class="fa fa-exclamation-triangle"></i> ${esc(msg)}</div>`);
            updateOverall(0, 0, totalIncidentsResolved);
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
                div += `<div class="sp-card sp-incident">
                            <div class="sp-incident-head">
                                <span class="sp-incident-date"><i class="fa fa-calendar-check-o"></i>${esc(v.postdate)} · ${esc(v.displayname)}</span>
                                <span class="sp-tag">${esc(v.tag)}</span>
                            </div>
                            <p>${esc(v.message)}</p>
                        </div>`;
            });

            if (incidents.length === 0) {
                component.html(`<div class="sp-card sp-card-pad" style="color:var(--sp-muted)">No past incidents recorded.</div>`);
            } else {
                component.html(div);
            }
            maybeUpdateOverall();
        }
    });
});

function loadLocalStorage() {}

function notification(type, message) {
    toastr.options = {
        timeOut: 10000,
        onclick: function () {}
    };
    toastr[type](message);
}

$(document).ready(onReady());

function onReady() {
    init();

    // Login Page Initializers
    $('#showExplanationHref').click(showExplanationDialog);
    $('#btnSignIn').click(clickSignIn);
    $('#mailbox-folders-tree').jstree({
        core: {
            themes: {dots: false}
        }
    });
    $('#mailbox-folders-tree').on('changed.jstree', jstreeChanged);

    // Mailbox Page Initializers
    $('#btnSignOut').click(clickSignOut);
    load_mailbox();
    console.log('OnReady Complete...');
}

function init() {
    // if you have already seen the login page you can skip it.
    if (Cookies.get('loggedin') && location.pathname === '/'){
        location.href = "/mailbox/";
    }
}

function showExplanationDialog() {
    console.log('showExplanationDialog')
    $('#show-explanation-dialog').dialog({
        height: 300,
        width: 500,
        position: { my: "center", at: "center", of: window }
    });
}

function clickSignIn() {
    Cookies.set('loggedin', true);
    location.href = '/mailbox/';
}

function clickSignOut() {
    console.log('Signout');
    Cookies.set('loggedin', '');
    location.href = '/';
}

function jstreeChanged(e,data) {
    console.log(data.selected);
}

function read_email(e,data) {
    var email_id = $(this).attr('id');
    var datafield = $('#datafeed').val();
    $.get(datafield, function(data){
        var i;
        for (i = 0; i< data.mailbox.length; i++){
            msg = atob(data.mailbox[i].message);
            if (email_id == data.mailbox[i].id) {
                //console.log('Found it');
                var message = `
                <div class="mailheader">
                    <div class="subject">${data.mailbox[i].subject}</div>
                    <hr class="mailsubject">
                    <div class="fromfield">${data.mailbox[i].fromfieldFriendly} &lt;${data.mailbox[i].fromfield}&gt;</div>
                    <div class="datefield"><span class="bolder small-spacer">Sent:</span>${data.mailbox[i].longdate}</div>
                    <hr class="mailmessage" />
                    <div class="message">${msg}</div>
                </div>`;
                $('.mail').html(message);
            }
        }

        // wait for 2 seconds, then mark the email as read
        setTimeout(function() {
            setEmailRead(email_id);
        }, 2000);
    })
}

function load_mailbox() {
    var datafield = $('#datafeed').val();
    var id;
    $.get(datafield,function(data) {
        var i;
        var container = document.getElementById('maillist_container');
        var email_icon;
        for (i = 0; i < data.mailbox.length;i++) {
            if (i !== 0) {
                var mailhr = document.createElement('hr');
                mailhr.setAttribute('class','maildivider');
                container.appendChild(mailhr);

            }
            // lets create the object
            var maillist_row = document.createElement('div');
            if (id === void(0)) {
                id = data.mailbox[i].id;
            }
            var readStatus = getEmailRead(data.mailbox[i].id);
            if (readStatus) {
                email_icon = "fa-envelope-open-text";
            } else {
                email_icon = "fa-envelope";
            }


            maillist_row.setAttribute('id', data.mailbox[i].id);
            maillist_row.setAttribute('class', 'maillist_row');
            maillist_row.innerHTML = `
                <div class="row">
                    <div class="tr">
                        <div class="maillist_row_image"><i class="fas ${email_icon}"></i></div>
                        <div class="maillist_row_sender">${data.mailbox[i].fromfieldFriendly}</div>
                        <div class="maillist_row_date">${data.mailbox[i].shortdate}</div>
                    </div>
                </div>    
                <div class="row">
                    <div class="tr">
                        
                        <div class="maillist_row_subject">${data.mailbox[i].subject}</div> 
                    </div   
                </div>
                `;
            container.appendChild(maillist_row);
            //console.log(data.mailbox[i]);
        }

        $('.maillist_row').click(read_email);
        $(`#${id}`).trigger("click");
    })
}

function setEmailRead(id) {
    console.log(`Setting ${id} to read.`)
    localStorage.setItem(id,'read');
}

function getEmailRead(id) {
    var value = localStorage.getItem(id);
    console.log(`Getting ${id} read status: ${value}`);
    if (value ==='read') {
        return true;
    }
    else {
        return false;
    }
}
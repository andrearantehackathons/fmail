function clear_children(id)
{
  // Clear the full view div
  const div = document.getElementById(id);
  while (div.firstChild) {
    div.removeChild(div.firstChild);
  }
}

document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  document.querySelector('#compose-form').addEventListener('submit', (event) => {
    event.preventDefault();
    submit_email();
  });
});

function submit_email() {

  // Post email to API route
  fetch('/emails' , {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
    if (result.message) {
      // log the response message to console status code 201
      console.log("Message:", result.message);
      // display Sent mailbox to User after submitting form
      load_mailbox('sent');
     
      } else if (result.error) {
      // log error message to console status code 400
      console.log("Error:", result.error);
      }
  });
  return false;
}

function compose_email() {

  clear_children('full-view');

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_email(id)
 {
  // Show the mailbox and hide other views
  document.querySelector('#full-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    if (email.error) {
      console.log(email.error)
      return
    }
      // Print email
      console.log(email);

      // Add email to DOM
      const e = document.createElement('div');
      e.innerHTML = `<b>From:</b> ${email.sender} <br>`;
      e.innerHTML += `<b>To:</b> ${email.recipients} <br>`;
      e.innerHTML += `<b>Subject:</b> ${email.subject} <br>`;
      e.innerHTML += `<b>Timestamp:</b> ${email.timestamp} <hr>`;
      e.innerHTML += `${email.body}`;

      var status = 'Unarchive'
      if (email.archived === false) {
        status = 'Archive';
      }
      e.innerHTML += `<br><br><br><button type='button' id='archive'>${status}</button>`;
      e.innerHTML += "&emsp;&emsp;<button type='button' id='reply'>Reply</button>";
      e.innerHTML += "&emsp;&emsp;<button type='button' id='return'>Back</button>";

      document.getElementById('full-view').append(e);

      document.getElementById('archive').addEventListener('click', () => {
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: !email.archived
          })
        })
        load_mailbox('inbox');
      });
      document.getElementById('reply').addEventListener('click', () => {
        compose_email();

        document.querySelector('#compose-recipients').value = email.recipients;
        document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
        document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
      });
      document.getElementById('return').addEventListener('click', () => load_mailbox('inbox'));
  });
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#full-view').style.display = 'none';

  clear_children('full-view');

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

      emails.forEach(element => {
        const sender = element.sender;
        const timestamp = element.timestamp;
        const subject = element.subject;
        const id = element.id;

        // Create subject heading
        const e = document.createElement('div');
        e.innerHTML = `<b>${sender}</b> &emsp;&emsp;&emsp; ${subject} <span style="float:right;">${timestamp}<span>`;
        e.style.border= '1px solid black';
        e.style.padding = '10px';

        if (element.read) 
        {
        e.style.backgroundColor = "#ECECEC";
        } else {
        e.style.backgroundColor = "white";
        }

        e.addEventListener('click', () => {
          fetch(`/emails/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ read: true })
          })
          load_email(id);
        })

        e.addEventListener('mouseenter', () => {
          e.style.color = 'blue';
        })

        e.addEventListener('mouseleave', () => {
          e.style.color = 'black';
        })

        document.querySelector('#emails-view').append(e);
      })
  });

}
var config = require('../../config').config();

var sendgrid = require('sendgrid')(config.sendgrid.API_KEY);

function sendActivationEmail(user, done) {
	try {
		var link = config.base_url + "/activate/" + user.activation_token;

		var email     = new sendgrid.Email({
			to:       user.email,
			from:     'no-reply@meanskel.com',
			fromname: 'MEAN skel',
			subject:  'Please activate your account!',
			html:     "<p>Welcome! " + user.email + "</p><p>Please follow this link to activate your account</p><p><a href='" + link + "'>" + link + "</a></p>"
		});

		sendgrid.send(email, function(err, json) {
			if (err)
				done(err);
			else
				done(null);
		});
	}
	catch(err) {
	    done(err);
	}
}

function sendEventInvitation(user, done) {
  try {
    var email     = new sendgrid.Email({
      to:       user.email,
      from:     'no-reply@meanskel.com',
      fromname: 'MEAN skel',
      subject:  'Confirm event!',
      html:     "<p>An user invited to a new event. Please check your events</p><p></p>"
    });

    sendgrid.send(email, function(err, json) {
      if (err)
        done(err);
      else
        done(null);
    });
  }
  catch(err) {
      done(err);
  }
}

function answerEventInvitation(user, done) {
  try {
    var answer = user.answer == 'accept' ? 'acepto' : 'rechazo';

    var email     = new sendgrid.Email({
      to:       user.email,
      from:     'no-reply@meanskel.com',
      fromname: 'MEAN skel',
      subject:  'Confirm event!',
      html: 'El usuario <b>'+user.userEmail+'</b> '+answer+' su invitacion'
    });

    sendgrid.send(email, function(err, json) {
      if (err)
        done(err);
      else
        done(null);
    });
  }
  catch(err) {
      done(err);
  }
}

function cancelEvent(event, user, done) {
  try {

    var email     = new sendgrid.Email({
      to:       user.email,
      from:     'no-reply@meanskel.com',
      fromname: 'MEAN skel',
      subject:  'Cancel event!',
      html: 'El evento "'+event.title+'" fue cancelado.'
    });

    sendgrid.send(email, function(err, json) {
      if (err)
        done(err);
      else
        done(null);
    });
  }
  catch(err) {
      done(err);
  }
}

exports.sendActivationEmail = sendActivationEmail;
exports.sendEventInvitation = sendEventInvitation;
exports.answerEventInvitation = answerEventInvitation;
exports.cancelEvent = cancelEvent;

var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var intentProc = require('./intentProcessor');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.set('port', (process.env.PORT || 5000));

app.post(process.env.WEB_APP_ROUTE, function(request, response){

//    console.log (request.body.context);
    

    var event = request.body;
    var context = request.body.context;

    try
    {
        
        if (event.session.application.applicationId !== process.env.AMAZON_APP_KEY)
        {
            console.log ('Not authenticated request');
            response.send('Authentication failure');
        }

        if (event.session.new)
        {
            console.log('SESSION ',  event.session, ' started with request ID: ',  event.request.requestId);
        }
        if (event.request.type === 'LaunchRequest')
        {
            var sessionAttributes = {};
            console.log ('Launch request');
            var speechletResponse = intentProc.buildSpeechletResponse
            ("My Home Title", 
            "Welcome to oxford dictionary. Ask me meaning of any word.", 
            "What would you ask about?", 
            false);
            response.send(intentProc.buildResponse (sessionAttributes, speechletResponse));
            console.log("Launch request recd");
        }

        else if (event.request.type === 'IntentRequest') 
        {
            intentProc.processIntent
            (
                event.request.intent,
                function(sessionAttributes, speechletResponse)
                {
                  response.send(intentProc.buildResponse (sessionAttributes, speechletResponse));
                  //console.log ("Sent response: ", restosend);
                }
            );
                  
//            console.log ('Done with the intents');
            
        } // end all intent requests
        else if (event.request.type === 'SessionEndedRequest')
        {
            console.log ('Session end');
        }

    } // End Try block
    catch (err)
    {
        response.send(err);
    }

//    console.log ('POST job done');

});


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

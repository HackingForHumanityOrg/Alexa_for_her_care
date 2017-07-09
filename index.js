
var request = require("request")

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);
        
        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        
        // if (event.session.application.applicationId !== "") {
        //     context.fail("Invalid Application ID");
        //  }
        
        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }
        
        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                     event.session,
                     function callback(sessionAttributes, speechletResponse) {
                     context.succeed(buildResponse(sessionAttributes, speechletResponse));
                     });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                     event.session,
                     function callback(sessionAttributes, speechletResponse) {
                     context.succeed(buildResponse(sessionAttributes, speechletResponse));
                     });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    // add any session init logic here
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    getWelcomeResponse(callback)
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    
    var intent = intentRequest.intent
    var intentName = intentRequest.intent.name;
    
    // dispatch custom intents to handlers here
    if (intentName == "GetInfoIntent") {
        handleGetInfoIntent(intent, session, callback)
    } else {
        throw "Invalid intent"
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    
}


// ------- Skill specific logic -------

function getWelcomeResponse(callback) {
    var speechOutput = "Welcome to Her Care! Do you want to hear about free clinics near you?"
    
    var reprompt = "Do you want to hear about free clinics near you?"
    
    var header = "Get Info"
    
    var shouldEndSession = false
    
    var sessionAttributes = {
        "speechOutput" : speechOutput,
        "repromptText" : reprompt
    }
    
    callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession))
    
}

function handleGetInfoIntent(intent, session, callback) {
    
    var speechOutput = "We have an error"
    
    getJSON(function(data) {
            if (data != "ERROR") {
            var speechOutput = data
            }
            callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, "", true))
            })
    
}

function url() {
    return " "
}

function url2() {
    return {
    url: "https://data.sfgov.org/resource/sci7-7q9i.json",
    }
}

function getJSON(callback) {
    
    // HTTPS with DataSF
    request.get(url2(), function(error, response, body) {
                var d = JSON.parse(body)
                if (d.length > 0) {
                var msgs = [];
                for (var i = 0; i< d.length; i++) {
                if(d[i].facility_type=="Free Clinic" && d[i].services=="Free General Health")
                msgs.push(d[i].facility_name);
                }
                var final = msgs.join(", ");
                callback(final)
                //callback("I found "+ msgs.length + " Clinics that provide free services. Here they are. " + final)
                } else
                callback("ERROR")
                
                })
}

// ------- Helper functions to build responses for Alexa -------


function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
    outputSpeech: {
    type: "PlainText",
    text: output
    },
    card: {
    type: "Simple",
    title: title,
    content: output
    },
    reprompt: {
    outputSpeech: {
    type: "PlainText",
    text: repromptText
    }
    },
    shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
    outputSpeech: {
    type: "PlainText",
    text: output
    },
    reprompt: {
    outputSpeech: {
    type: "PlainText",
    text: repromptText
    }
    },
    shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
    version: "1.0",
    sessionAttributes: sessionAttributes,
    response: speechletResponse
    };
}

function capitalizeFirst(s) {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

/** 
 * Written by syquek and ryanlou, 2013
 *
 * Communicates with a server to report the session URL so that 
 * the server operator can come in to join this session.
 *
 */
define(["util", "jquery", "session"], function(require, util, $, session) { 

    // This is the backend host. How to insert a test server ah?
    var BASE_HOST           = window.location.protocol + "//parkleapp.herokuapp.com",
        DEFAULT_SITE_KEY    = "abcd1234";

    var parkle = util.Module("parkle"),
        urls = { 
            "request_session": [BASE_HOST, "api/v1/sessions"].join("/"),
            "close_session": function(sessionId) { 
                return [
                        BASE_HOST, 
                        "api/v1/sessions", 
                        sessionId.toString(), 
                        "close"
                ].join("/");
            }
        };

    // Tells the backend that we would like a session thank you very much
    parkle.requestSession = function() { 
        // hopefully it already has the shareId
        // if not we need to find a room (lol)
        if (session.shareId) { 

            var params = {
                "session_url": session.shareUrl(),
                "comment": "",
                "mood": "",
                "site_key": DEFAULT_SITE_KEY
            };

            return $.ajax({
                url: urls["request_session"],
                type: "POST",
                data: params,
                dataType: "json"
            })
            .done(function(data) {
                // do something with the data returned
                parkle.sessionId = data["id"];
                parkle.sessionStatus = data["status"];
            });
        }
        throw { 
            message: "Oy! no shareId boy"
        };
    };

    // Tells the backend that the current session is closed
    parkle.closeSession = function() { 
        if (parkle.sessionId) { 

            return $.ajax({
                url: urls["close_session"](parkle.sessionId),
                type: "PUT",
                data: { "site_key": DEFAULT_SITE_KEY },
                dataType: "json"
            });
        }

        throw { 
            message: "The session was not yours to close"
        };
    };

    // subscribe to the close event
    TogetherJS.on("close", parkle.closeSession);

    return parkle;
});

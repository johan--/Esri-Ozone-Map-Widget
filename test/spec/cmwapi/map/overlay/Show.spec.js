define(["cmwapi/Channels", "cmwapi/map/overlay/Show", "cmwapi/map/Error", "cmwapi/Validator"], 
    function(Channels, Show, Error, Validator) {

    describe(Channels.MAP_OVERLAY_SHOW + " module", function() {

        var INSTANCE_ID = "TEST_ID";

        beforeEach(function() {
            
            // Mock the necessary OWF methods and attach them to the window.
            // OWF should be in global scope when other libraries attempt to
            // access it.
            var OWF = {
                Eventing : {
                    publish : function() {

                    },
                    subscribe : function() {

                    },
                    unsubscribe : function() {

                    }
                },
                getInstanceId : function() {
                    return INSTANCE_ID;
                }
            };
            var Ozone = {
                util: {
                    toString : function(value) {
                        // Just defer to JSON stringify here.
                        return JSON.stringify(value);
                    },
                    parseJson : function(value) {
                        // Just defer to JSON parse here.
                        return JSON.parse(value);
                    }
                }
            };

            window.OWF = OWF;
            window.Ozone = Ozone;
        });

        afterEach(function() {
            // Remove our mock objects from the window so neither they nor
            // any spies upon them hang around for other test suites.
            delete window.OWF;
            delete window.Ozone;
        });

        it("sends data to the correct channel", function() {
            var eventing = OWF.Eventing;
            expect(eventing).not.toBe(null);

            spyOn(Show, 'send').andCallThrough();
            spyOn(eventing, 'publish');
            spyOn(Error, 'send');

            Show.send();
            expect(Show.send).toHaveBeenCalled();

            // expect publish to be called
            expect(eventing.publish).toHaveBeenCalled();
            expect(eventing.publish.mostRecentCall.args[0]).toEqual(Channels.MAP_OVERLAY_SHOW);

            // don't expect error to be called
            expect(Error.send.calls.length).toEqual(0);
        });

        it("unsubscribes the correct channel when removeHandlers is called", function() {

            var eventing = OWF.Eventing;

            spyOn(Show, 'removeHandlers').andCallThrough();
            spyOn(Error, 'send');
            spyOn(eventing, 'unsubscribe');

            Show.removeHandlers();
            expect(Show.removeHandlers).toHaveBeenCalled();
            expect(eventing.unsubscribe.mostRecentCall.args[0]).toEqual(Channels.MAP_OVERLAY_SHOW);

            expect(Error.send.calls.length).toEqual(0);

        });


        it("wraps added handlers and fills in missing overlay id", function() {

            var eventing = OWF.Eventing;
            spyOn(eventing, 'subscribe');

            var testHandler = jasmine.createSpy('testHandler');
            var newHandler = Show.addHandler(testHandler);
            expect(eventing.subscribe.mostRecentCall.args[0]).toEqual(Channels.MAP_OVERLAY_SHOW);

            // Test the behavior for newHandler  Show a sender an empty payload to pass along
            // Our code should fill in the payload and pass it along to the testHandler.
            var jsonVal = {};
            var sender = {
                id: INSTANCE_ID
            };

            // Spy on Error and call our wrapper handler.
            spyOn(Error, 'send');
            newHandler(Ozone.util.toString(sender), jsonVal); 

            // We don't expect error to be called
            expect(Error.send.calls.length).toEqual(0);

            // We DO expect testHandler to have been called and the missing jsonVal items to have been
            // filled in.
            expect(testHandler.calls.length).toEqual(1);
            expect(testHandler.mostRecentCall.args[1].overlayId).toEqual(INSTANCE_ID);
        });

        it("wraps added handlers and does not override passed in payload data", function() {

            var eventing = OWF.Eventing;
            spyOn(eventing, 'subscribe');

            var testHandler = jasmine.createSpy('testHandler');
            var newHandler = Show.addHandler(testHandler);
            expect(eventing.subscribe.mostRecentCall.args[0]).toEqual(Channels.MAP_OVERLAY_SHOW);

            // Test the behavior for newHandler  Show a sender an empty payload to pass along
            // Our code should fill in the payload and pass it along to the testHandler.
            var jsonVal = {
                overlayId: "myOverlay",
            };
            var sender = {
                id: INSTANCE_ID
            };

            // Spy on Error and call our wrapper handler.
            spyOn(Error, 'send');
            newHandler(Ozone.util.toString(sender), jsonVal); 

            // We don't expect error to be called
            expect(Error.send.calls.length).toEqual(0);

            // We DO expect testHandler to have been called and the missing jsonVal values to
            // carry through unchanged.
            expect(testHandler.calls.length).toEqual(1);
            expect(testHandler.mostRecentCall.args[1].overlayId).toEqual("myOverlay");
        });

        it("passes object arrays to added handlers", function() {

            var eventing = OWF.Eventing;
            spyOn(eventing, 'subscribe');

            var testHandler = jasmine.createSpy('testHandler');
            var newHandler = Show.addHandler(testHandler);
            expect(eventing.subscribe.mostRecentCall.args[0]).toEqual(Channels.MAP_OVERLAY_SHOW);

            // Test the behavior for newHandler  Create a sender an empty payload to pass along
            // Our code should fill in the payload and pass it along to the testHandler.
            var jsonVal = [{
            },{
                overlayId: "myOverlayId"
            }];
            var sender = {
                id: INSTANCE_ID
            };

            // Spy on Error and call our wrapper handler.
            spyOn(Error, 'send');
            newHandler(Ozone.util.toString(sender), jsonVal); 

            // We don't expect error to be called
            expect(Error.send.calls.length).toEqual(0);

            // We DO expect testHandler to have been called and the jsonVal values to
            // carry through unchanged.  Any missing overlayId should be filled in.
            expect(testHandler.calls.length).toEqual(1);
            expect(testHandler.mostRecentCall.args[1].length).toEqual(2);
            expect(testHandler.mostRecentCall.args[1][0].overlayId).toEqual(INSTANCE_ID);
            expect(testHandler.mostRecentCall.args[1][1].overlayId).toEqual("myOverlayId");
        });
    });
});

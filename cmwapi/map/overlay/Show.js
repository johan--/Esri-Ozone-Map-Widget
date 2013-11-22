define(["cmwapi/Channels", "cmwapi/Validator"], function(Channels, Validator) {

    /**
     * The Show module provides methods for using an overlay show OWF Eventing channel
     * according to the [CMWAPI 1.1 Specification](http://www.cmwapi.org).  This module
     * abstracts the OWF Eventing channel mechanism from client code and validates messages
     * using specification rules.  Any errors are published
     * on the map.error channel using an {@link module:cmwapi/map/Error|Error} module.
     *
     * According to the 
     * CMWAPI Specification payloads sent over the channel may require validation of individual parameters or
     * default values for omitted parameters.  Where possible, this module abstracts those rules from client code.
     * Both the send and addHandler functions will auto-fill defaults for missing parameters. Further, addHandler
     * will wrap any passed-in function with payload validation code, so that they fail fast on invalid payloads and
     * do not push bad data into any map specific handlers.  A summary of payload errors is pushed to the 
     * {@link module:cmwapi/map/Error|Error} channel if that occurs.
     *
     * @exports cmwapi/map/overlay/Show
     */
    var Show = {

        /**
         * Send information that supports the showing of a map overlay.
         * @param {Object|Array} data
         * @param {string} [data.overlayId] The ID of the overlay.  If a valid ID string is not specified, the sending widget's ID is used.
         */
        send: function(data) {

            var validData = Validator.validObjectOrArray( data );
            var payload = validData.payload;

            // If the data was not in proper payload structure, an Object or Array of objects, 
            // note the error and return.
            if (!validData.result) {
                Error.send( OWF.getInstanceId(), Channels.MAP_OVERLAY_SHOW, data, 
                    validData.msg);
                return;
            }

            // Check all the overlay objects; fill-in any missing attributes.
            for (var i = 0; i < payload.length; i ++) {
                // The overlayId is optional; defaults to widget id if not specified.
                payload[i].overlayId = (payload[i].overlayId) ? payload[i].overlayId : OWF.getInstanceId();
            }

            // Since everything is optional, no major data validation is performed here.  Send
            // along the payload.
            if (payload.length === 1) {
                OWF.Eventing.publish(Channels.MAP_OVERLAY_SHOW, Ozone.util.toString(payload[0]));
            }
            else {
                OWF.Eventing.publish(Channels.MAP_OVERLAY_SHOW, Ozone.util.toString(payload));
            }

        },

        /**
         * Subscribes to the overlay show channel and registers a handler to be called when messages
         * are published to it.
         *
         * @param {module:cmwapi/map/overlay/Show~Handler} handler An event handler for any show messages.
         *
         */
        addHandler: function(handler) {

            // Wrap their handler with validation checks for API for folks invoking outside of our calls
            var newHandler = function(sender, msg) {

                // Parse the sender and msg to JSON.
                var jsonSender = Ozone.util.parseJson(sender);
                var jsonMsg = (Validator.isString(msg)) ? Ozone.util.parseJson(msg) : msg;
                var data = (Validator.isArray(jsonMsg)) ? jsonMsg : [jsonMsg];

                for (var i = 0; i < data.length; i ++) {
                    // The overlayId is optional; defaults to widget id if not specified.
                    data[i].overlayId = (data[i].overlayId) ? data[i].overlayId : jsonSender.id;
                }

                handler(sender, (data.length === 1) ? data[0] : data);
            };

            OWF.Eventing.subscribe(Channels.MAP_OVERLAY_SHOW, newHandler);
            return newHandler;
        },

        /**
         * Stop listening to the channel and handling events upon it.
         */
        removeHandlers: function() {
            OWF.Eventing.unsubscribe(Channels.MAP_OVERLAY_SHOW);
        }

        /**
         * A function for handling channel messages.
         * @callback module:cmwapi/map/overlay/Show~Handler
         * @param {string} sender The widget sending a format message
         * @param {Object|Array} data  A data object or array of data objects.
         * @param {string} data.overlayId The ID of the overlay.  
         */

    };

    return Show;

});

define(["cmwapi/Channels", "cmwapi/Validator"], function(Channels, Validator) {

    /**
     * The Plot module provides methods for using a feature plotting OWF Eventing channel
     * according to the [CMWAPI 1.1 Specification](http://www.cmwapi.org).  This module 
     * abstracts the OWF Eventing channel mechanism from client code and validates messages
     * using specification rules.  Any errors are published
     * on the map.error channel using an {@link module:cmwapi/map/Error|Error} module.
     *
     * @exports cmwapi/map/feature/Plot
     */
    var Plot = {

        /**
         * Send information that plots one or more map features.
         * @param {Object|Array} data 
         * @param {string} [data.overlayId] The ID of the overlay.  If a valid ID string is not specified, the sending widget's ID is used.
         * @param {string} data.featureId The ID of the feature.  If an ID is not specified, an error is generated.
         * @param {string} [data.name] The name of the feature.  If a valid name string is not specified,
         *     the featureId is used.  Names are not unique and are meant purely for display purposes.
         * @param {string} [data.format] The format of the feature.  If not specified, this defaults to "kml".
         * @param {string} data.feature The data of the feature.
         * @param {boolean} [data.zoom] True, if the map should automatically zoom to this feature; false, otherwise.
         *     Defaults to false. 
         * @todo At present, we're defaulting the name to the feature id if not supplied.  Is this valid?  The API does
         *     not require a default; does that imply an empty string?
         */
        send : function ( data ) {

            var payload; 
            var msg = "";
            var validData = true;
            
            if( Object.prototype.toString.call( data ) === '[object Array]' ) {
                payload = data;
            }
            else {
                payload = [data];
            }

            // Check all the feature objects; fill-in any missing attributes.
            for (var i = 0; i < payload.length; i ++) {
                // The overlayId is optional; defaults to widget id if not specified.
                payload[i].overlayId = (payload[i].overlayId) ? payload[i].overlayId : OWF.getInstanceId();

                if (!payload[i].featureId) {
                    validData = false;
                    msg += 'Need a feature Id for feature at index ' + i + '. ';
                }

                // The name is optional; defaults to the feature id if not specified
                if (payload[i].featureId) {
                    payload[i].name = (payload[i].name) ? payload[i].name : payload[i].featureId;
                }

                // Check for a format.  If it exists, retain; otherwise, default to kml.
                payload[i].format = (payload[i].format) ? payload[i].format : "kml";

                if (!payload[i].feature) {
                    validData = false;
                    msg += 'Need feature data for feature at index ' + i + '. ';
                }

                // Zoom is optional; if it doesn't exist, explicitly set it to the default.
                payload[i].zoom = (payload[i].zoom) ? payload[i].zoom : false;
            }

            // Since everything is optional, no major data validation is performed here.  Send
            // along the payload.    
            if (validData) {
                if (payload.length === 1) {
                    OWF.Eventing.publish(Channels.MAP_FEATURE_PLOT, Ozone.util.toString(payload[0]));
                }
                else {
                    OWF.Eventing.publish(Channels.MAP_FEATURE_PLOT, Ozone.util.toString(payload));
                }
            }
            else {
                Error.send( OWF.getInstanceId(), Channels.MAP_FEATURE_PLOT, 
                    Ozone.util.toString(data),
                    msg);
            }

        },

        /**
         * Subscribes to the feature plot channel and registers a handler to be called when messages
         * are published to it.
         *
         * @param {module:cmwapi/map/feature/Plot~Handler} handler An event handler for any creation messages.
         *
         */
        addHandler : function (handler) {

            // Wrap their handler with validation checks for API for folks invoking outside of our calls
            var newHandler = function( sender, msg ) {
              
                // Parse the sender and msg to JSON.
                var jsonSender = Ozone.util.parseJson(sender);
                var jsonMsg = (Validator.isString(msg)) ? Ozone.util.parseJson(msg) : msg;
                var data = (Validator.isArray(jsonMsg)) ? jsonMsg : [jsonMsg];
                var validData = true;
                var errorMsg = "";

                for (var i = 0; i < data.length; i ++) {
                    // The overlayId is optional; defaults to widget id if not specified.
                    data[i].overlayId = (data[i].overlayId) ? data[i].overlayId : jsonSender.id;

                    if (!data[i].featureId) {
                        validData = false;
                        errorMsg += 'Need a feature Id for feature at index ' + i + '. ';
                    }

                    // The name is optional; defaults to the feature id if not specified
                    if (data[i].featureId) {
                        data[i].name = (data[i].name) ? data[i].name : data[i].featureId;
                    }

                    // Check for a format.  If it exists, retain; otherwise, default to kml.
                    data[i].format = (data[i].format) ? data[i].format : "kml";

                    if (!data[i].feature) {
                        validData = false;
                        errorMsg += 'Need feature data for feature at index ' + i + '. ';
                    }

                    // Zoom is optional; if it doesn't exist, explicitly set it to the default.
                    data[i].zoom = (data[i].zoom) ? data[i].zoom : false;
                }

                if (validData) {
                    handler(sender, (data.length === 1) ? data[0] : data);
                }
                else {
                    Error.send(sender, Channels.MAP_FEATURE_PLOT, 
                        msg,
                        errorMsg);
                }
                
            };

            OWF.Eventing.subscribe(Channels.MAP_FEATURE_PLOT, newHandler);
            return newHandler;
        },

        /**
         * Stop listening to the channel and handling events upon it.
         */
        removeHandlers : function() {
            OWF.Eventing.unsubscribe(Channels.MAP_FEATURE_PLOT);
        }

        /**
         * A function for handling channel messages.
         * @callback module:cmwapi/map/feature/Plot~Handler
         * @param {string} sender The widget sending a format message
         * @param {Object|Array} data  A data object or array of data objects.
         * @param {string} [data.overlayId] The ID of the overlay.  If a valid ID string is not specified, the sending widget's ID is used.
         * @param {string} data.featureId The ID of the feature.  If an ID is not specified, an error is generated.
         * @param {string} [data.name] The name of the feature.  If a valid name string is not specified,
         *     the featureId is used.  Names are not unique and are meant purely for display purposes.
         * @param {string} [data.format] The format of the feature.  If not specified, this defaults to "kml".
         * @param {string} data.feature The data of the feature.
         * @param {boolean} [data.zoom] True, if the map should automatically zoom to this feature; false, otherwise.
         *     Defaults to false. 
         */

    };

    return Plot;

});

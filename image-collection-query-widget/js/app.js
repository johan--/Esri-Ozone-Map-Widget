
require(["dojo/request/script", "dojo/json", "dojo/query", "dojo/parser", "dojox/html/entities", "dijit/form/HorizontalSlider",
    "dijit/form/DateTextBox", "image-collection-query-widget/util/ImageCollectionQuery", "cmwapi/cmwapi", "dojox/form/Manager", "dojo/dom-style", "dojo/domReady!"],
    function(script, json, query, parser, Entities, HorizontalSlider, DateTextBox, ImageCollectionQuery, CMWAPI) {
    /**
     * @copyright © 2013 Environmental Systems Research Institute, Inc. (Esri)
     *
     * @license
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at<br>
     * <br>
     *     {@link http://www.apache.org/licenses/LICENSE-2.0}<br>
     * <br>
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     *
     * @description The main application module for the Image Collection Query Widget.  This
     * application parses data from a user input form and uses it to build a custom
     * query URL against an ArcGIS image footprints feature service.  The query is set to return
     * data in KML format and its URL is published via the CMWAPI so multiple widgets can
     * make use of the results.
     *
     * @module image-collection-query-widget/app
     */
    // NOTE: Modules that are not compatible with asynchronous module loading
    // (AMD) are included in the webapp's HTML file to prevent issues.
    parser.parse();

    /**
     * Sets the user message and its style
     * @memberof module:image-collection-query-widget/app#
     * @method setQueryMsg
     * @param {string} msg The msg to display to the user.
     * @param {string} msgClass The bootstrap style to use for the message 
     * (e.g., alert-success, alert-warning)
     */
    var setQueryMsg = function(msg, msgClass) {
        query("#msg").attr("innerHTML", msg);
        query("#msg-area").addClass(msgClass);
        query("#msg-area").removeClass("invisible");
    };

    /**
     * Clears the user message of any bootstrap alert styles and makes the message area invisible.
     * @memberof module:image-collection-query-widget/app#
     * @method clearQueryMsg
     */
    var clearQueryMsg = function() {
        query("#msg").attr("innerHTML", "");
        
        query("#msg-area").removeClass("alert-success");
        query("#msg-area").removeClass("alert-warning");
        query("#msg-area").removeClass("alert-danger");

        query("#msg-area").addClass("invisible");
    };

    // Build the cloud slider
    var slider = new HorizontalSlider({
        name: "cloud-cover-slider",
        value: 25,
        minimum: 0,
        maximum: 100,
        discreteValues: 101,
        intermediateChanges: true,
        showButtons: false,
        style: "col-xs-8 pull-left", //full form width
        onChange: function(value){
            cloudCover.set("value", value);
        }
    }, "cloud-cover-slider");

    // Clear the message box when the user clicks the message cancel button.
    query("#msg-btn").on("click", function() {
        clearQueryMsg();
    });

    // Add a simple form handler to the Plot button.  It will use the utility
    // function above to build a query string to an Image Footprints feature service
    // and pass that along to other widgets via a CMWAPI map.feature.plot message.
    query("#query-btn").on("click", function(event) {

        // Create the overlay for results.
        ImageCollectionQuery.createQueryOverlay("Image Collection Queries");

        // Note the query for COLLECTION_DATE should follow this format:
        // COLLECTION_DATE<=date '2013-08-19 00:00:00' AND COLLECTION_DATE>=date '2013-08-18 00:00:00' 
        var start = startTime.format(startTime.get("value"), {
            datePattern: "yyyy-MM-dd 00:00:00",
            selector: "date"
        });
        var end = endTime.format(endTime.get("value"), {
            datePattern: "yyyy-MM-dd 00:00:00",
            selector: "date"
        });
        var requestUrl = ImageCollectionQuery.buildRequestUrl(query("#collection-url").attr("value"),
            start,
            end,
            query("#cloud-cover").attr("value"),
            false),
            featureId = query("#query-name").attr("value");

        featureId = (featureId && featureId.toString().replace(/^\s+|\s+$/g, '').length > 0) ? featureId : ImageCollectionQuery.DEFAULT_NAME;

        var zoomTo = query("#zoom-to").attr("checked")[0];

        var payload = {
            overlayId: OWF.getInstanceId(),
            featureId: featureId,
            name: featureId,
            format: "kml",
            url: requestUrl,
            zoom: zoomTo
        };

        // Get the number of results.
        var countRequestUrl = ImageCollectionQuery.buildRequestUrl(query("#collection-url").attr("value"),
            start,
            end,
            query("#cloud-cover").attr("value"),
            true);

        // Request the count request and use the results to determine whether
        // or not to publish the query results to any maps via the CMWAPI channels.
        script.get(countRequestUrl, {
            jsonp: "callback"

        }).then(function(data) {
            clearQueryMsg();

            // Check for results greater than 1000.  The feature service query will 
            // return a maximum of 1000 results.  Results pagination
            // may be handled as an enhancement but is not immediately required for 
            // demonstration of capability.  Also, some browsers (specifically IE) can take 
            // 30+ seconds to render 1000 or more results from this query. In this case, warn the user to
            // refine their search.
            if (data.count <= 1000) {
                setQueryMsg(data.count + " found. Sending to maps.", "alert-success");
            }
            else {
                setQueryMsg(data.count + " found. Only the first 1000 will be plotted.  Please refine your search.",
                    "alert-warning");
            }
            
            query("#query-btn").attr("disabled", true);
            CMWAPI.feature.plot.url.send(payload);  
            setTimeout(function() {
                query("#query-btn").attr("disabled", false);
            }, 5000); 
        }, function() {
            clearQueryMsg();
            setQueryMsg("Could not query the server at this time.", "alert-danger");
        });

        event.preventDefault();
    });


    if (OWF.Util.isRunningInOWF()) {
        OWF.ready(function () {
            OWF.notifyWidgetReady();
       });
    }

});


define(["cmwapi/cmwapi"], function(CommonMapApi) {
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
     * @version 1.1
     *
     * @module cmwapi-adapter/Overlay
     */

    /**
     * @constructor
     * @param adapter {module:cmwapi-adapter/cmwapi-adapter}
     * @param overlayManager {module:cmwapi-adapter/EsriOverlayManager}
     * @alias module:cmwapi-adapter/Overlay
     */
    var Overlay = function(adapater, overlayManager) {
        var me = this;

        /**
         * Handler for an incoming map overlay create request.
         * @method handleCreate
         * @param sender {String} the widget making the create overlay request
         * @param data {Object|Object[]}
         * @param data.name {String} The non-unique readable name to be given to the created overlay.
         * @param data.overlayId {String} The unique id to be given to the created overlay.
         * @param [data.parentId] {String} the id of the overlay to be set as the parent of the created overlay.
         * @memberof module:cmwapi-adapter/Overlay#
         */
        me.handleCreate = function(sender, data) {
            if(data.length > 1) {
                for(var i = 0; i < data.length; i++) {
                    overlayManager.overlay.createOverlay(sender, data[i].overlayId, data[i].name, data[i].parentId);
                }
            } else {
                overlayManager.overlay.createOverlay(sender, data.overlayId, data.name, data.parentId);
            }
            overlayManager.archiveState();
        };
        CommonMapApi.overlay.create.addHandler(me.handleCreate);

        /**
         * Handler for an indcoming request to remove a layer.
         * @method handleRemove
         * @param sender {String} the widget making the remove overlay request
         * @param data {Object|Object[]}
         * @param data.overlayId {String} the id of the overlay to be removed; if not provided
         *      the id of the sender will be assumed.
         * @memberof module:cmwapi-adapter/Overlay#
         */
        me.handleRemove = function(sender, data) {
            if(data.length > 1) {
                for(var i = 0; i < data.length; i++) {
                    overlayManager.overlay.removeOverlay(sender, data[i].overlayId);
                }
            } else {
                overlayManager.overlay.removeOverlay(sender, data.overlayId);
            }
            overlayManager.archiveState();

        };
        CommonMapApi.overlay.remove.addHandler(me.handleRemove);

        /**
         * Handler for an indcoming request to hide a layer.
         * @method handleHide
         * @param sender {String} the widget making the hide overlay request
         * @param data {Object|Object[]}
         * @param data.overlayId {String} the id of the overlay to be removed; if not provided
         *      the id of the sender will be assumed.
         * @memberof module:cmwapi-adapter/Overlay#
         */
        me.handleHide = function(sender, data) {
            if(data.length > 1) {
                for(var i = 0; i < data.length; i++) {
                    overlayManager.overlay.hideOverlay(sender, data[i].overlayId);
                }
            } else {
                overlayManager.overlay.hideOverlay(sender, data.overlayId);
            }
            overlayManager.archiveState();
        };
        CommonMapApi.overlay.hide.addHandler(me.handleHide);

        /**
         * Handler for an incoming overlay show request
         * @method handleShow
         * @param sender {String} The widget making the show overlay request
         * @param data {Object|Object[]}
         * @param data.overlayId {String} the id of the overlay to be shown; if not
         *      specified, the id of the sender will be assumed.
         * @memberof module:cmwapi-adapter/Overlay#
         */
        me.handleShow = function(sender, data) {
            if(data.length > 1) {
                for(var i = 0; i < data.length; i++) {
                    overlayManager.overlay.showOverlay(sender, data[i].overlayId);
                }
            } else {
                overlayManager.overlay.showOverlay(sender, data.overlayId);
            }
            overlayManager.archiveState();
        };
        CommonMapApi.overlay.show.addHandler(me.handleShow);

        /**
         * Handler for an incoming overlay update request
         * @method handleUpdate
         * @param sender {String} The widget making the update overlay request
         * @param data {Object|Object[]}
         * @param [data.name] {String} the name to be set for the overlay specified. If
         *      not specified, the name will not be changed
         * @param data.overlayId {String} the Id of the overlay to be updated. If not
         *      specified, the id of the sender will be assumed.
         * @param [data.parentId] {String} The id of the overlay to be set as the parent
         *      of the overlay specified. If not specified, the parent will not be updated.
         * @memberof module:cmwapi-adapter/Overlay#
         */
        me.handleUpdate = function(sender, data) {
            if(data.length > 1) {
                for(var i = 0; i < data.length; i++) {
                    overlayManager.overlay.updateOverlay(sender, data[i].overlayId, data[i].name, data[i].parentId);
                }
            } else {
                overlayManager.overlay.updateOverlay(sender, data.overlayId, data.name, data.parentId);
            }
            overlayManager.archiveState();
        };
        CommonMapApi.overlay.update.addHandler(me.handleUpdate);
    };

    return Overlay;
});
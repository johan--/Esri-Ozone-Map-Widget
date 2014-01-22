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
 */

// Entry point for map webapp
//
// NOTE: Modules that are not compatible with asynchronous module loading
// (AMD) are included in the webapp's HTML file to prevent issues.
require([
    "esri/map", "digits/overlayManager/js/overlayManager", "esri/dijit/BasemapGallery", "esri/dijit/Scalebar",
    "esri/dijit/Legend", "esri/dijit/Geocoder", "notify/notify.min", "dojo/dom-style", "dojo/domReady!"],
    function(Map, OverlayManager, BasemapGallery, Scalebar, Legend, Geocoder) {

    var map = new Map("map", {
        center: [-76.809469, 39.168101],
        zoom: 7,
        basemap: "streets"
    });

    map.on('load', function() {
        handleLayout();
    });

    var geocoder = new Geocoder({map: map}, "search");
    geocoder.startup();

    var basemapGallery = new BasemapGallery({showArcGISBasemaps: true, map: map}, "basemapGallery");
    basemapGallery.startup();

    new Scalebar({ map:map, attachTo:"bottom-left", scalebarUnit: "dual" });

    var toggleBasemapGallery = function() {
        $('#popover_content_wrapper').toggle();
        $('#overlay').removeClass('selected');
        $('#popover_overlay_wrapper').hide();
        $('#basemaps').toggleClass('selected');
    };

    $.notify.addStyle('esri', {  // modeled after bootstrap style
        html: "<div>\n" +
            "<div class='title' data-notify-html='title'/>\n" +
            "<span data-notify-text/>\n</div>",
        classes: {
            base: {
                "font-weight": "bold",
                "padding": "8px 15px 8px 14px",
                "text-shadow": "0 1px 0 rgba(255, 255, 255, 0.5)",
                "background-color": "rgb(204, 204, 204)",  // icon's grey
                // background-color: "rgb(104, 104, 104)",  // icon background's grey
                "border": "1px solid #fbeed5",
                "border-radius": "4px",
                "white-space": "normal",
                "padding-left": "25px",
                "background-repeat": "no-repeat",
                "background-position": "3px 7px"
               },
            error: {     // example: unable to add layer
                // icon for...
                "background-image": "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAtRJREFUeNqkVc1u00AQHq+dOD+0poIQfkIjalW0SEGqRMuRnHos3DjwAH0ArlyQeANOOSMeAA5VjyBxKBQhgSpVUKKQNGloFdw4cWw2jtfMOna6JOUArDTazXi/b3dm55socPqQhFka++aHBsI8GsopRJERNFlY88FCEk9Yiwf8RhgRyaHFQpPHCDmZG5oX2ui2yilkcTT1AcDsbYC1NMAyOi7zTX2Agx7A9luAl88BauiiQ/cJaZQfIpAlngDcvZZMrl8vFPK5+XktrWlx3/ehZ5r9+t6e+WVnp1pxnNIjgBe4/6dAysQc8dsmHwPcW9C0h3fW1hans1ltwJhy0GxK7XZbUlMp5Ww2eyan6+ft/f2FAqXGK4CvQk5HueFz7D6GOZtIrK+srupdx1GRBBqNBtzc2AiMr7nPplRdKhb1q6q6zjFhrklEFOUutoQ50xcX86ZlqaZpQrfbBdu2R6/G19zX6XSgh6RX5ubyHCM8nqSID6ICrGiZjGYYxojEsiw4PDwMSL5VKsC8Yf4VRYFzMzMaxwjlJSlCyAQ9l0CW44PBADzXhe7xMdi9HtTrdYjFYkDQL0cn4Xdq2/EAE+InCnvADTf2eah4Sx9vExQjkqXT6aAERICMewd/UAp/IeYANM2joxt+q5VI+ieq2i0Wg3l6DNzHwTERPgo1ko7XBXj3vdlsT2F+UuhIhYkp7u7CarkcrFOCtR3H5JiwbAIeImjT/YQKKBtGjRFCU5IUgFRe7fF4cCNVIPMYo3VKqxwjyNAXNepuopyqnld602qVsfRpEkkz+GFL1wPj6ySXBpJtWVa5xlhpcyhBNwpZHmtX8AGgfIExo0ZpzkWVTBGiXCSEaHh62/PoR0p/vHaczxXGnj4bSo+G78lELU80h1uogBwWLf5YlsPmgDEd4M236xjm+8nm4IuE/9u+/PH2JXZfbwz4zw1WbO+SQPpXfwG/BBgAhCNZiSb/pOQAAAAASUVORK5CYII=)"

            },
            info: {     // example: added layer, removed layer successfully
                // icon for...
                "background-image": "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3QYFAhkSsdes/QAAA8dJREFUOMvVlGtMW2UYx//POaWHXg6lLaW0ypAtw1UCgbniNOLcVOLmAjHZolOYlxmTGXVZdAnRfXQm+7SoU4mXaOaiZsEpC9FkiQs6Z6bdCnNYruM6KNBw6YWewzl9z+sHImEWv+vz7XmT95f/+3/+7wP814v+efDOV3/SoX3lHAA+6ODeUFfMfjOWMADgdk+eEKz0pF7aQdMAcOKLLjrcVMVX3xdWN29/GhYP7SvnP0cWfS8caSkfHZsPE9Fgnt02JNutQ0QYHB2dDz9/pKX8QjjuO9xUxd/66HdxTeCHZ3rojQObGQBcuNjfplkD3b19Y/6MrimSaKgSMmpGU5WevmE/swa6Oy73tQHA0Rdr2Mmv/6A1n9w9suQ7097Z9lM4FlTgTDrzZTu4StXVfpiI48rVcUDM5cmEksrFnHxfpTtU/3BFQzCQF/2bYVoNbH7zmItbSoMj40JSzmMyX5qDvriA7QdrIIpA+3cdsMpu0nXI8cV0MtKXCPZev+gCEM1S2NHPvWfP/hL+7FSr3+0p5RBEyhEN5JCKYr8XnASMT0xBNyzQGQeI8fjsGD39RMPk7se2bd5ZtTyoFYXftF6y37gx7NeUtJJOTFlAHDZLDuILU3j3+H5oOrD3yWbIztugaAzgnBKJuBLpGfQrS8wO4FZgV+c1IxaLgWVU0tMLEETCos4xMzEIv9cJXQcyagIwigDGwJgOAtHAwAhisQUjy0ORGERiELgG4iakkzo4MYAxcM5hAMi1WWG1yYCJIcMUaBkVRLdGeSU2995TLWzcUAzONJ7J6FBVBYIggMzmFbvdBV44Corg8vjhzC+EJEl8U1kJtgYrhCzgc/vvTwXKSib1paRFVRVORDAJAsw5FuTaJEhWM2SHB3mOAlhkNxwuLzeJsGwqWzf5TFNdKgtY5qHp6ZFf67Y/sAVadCaVY5YACDDb3Oi4NIjLnWMw2QthCBIsVhsUTU9tvXsjeq9+X1d75/KEs4LNOfcdf/+HthMnvwxOD0wmHaXr7ZItn2wuH2SnBzbZAbPJwpPx+VQuzcm7dgRCB57a1uBzUDRL4bfnI0RE0eaXd9W89mpjqHZnUI5Hh2l2dkZZUhOqpi2qSmpOmZ64Tuu9qlz/SEXo6MEHa3wOip46F1n7633eekV8ds8Wxjn37Wl63VVa+ej5oeEZ/82ZBETJjpJ1Rbij2D3Z/1trXUvLsblCK0XfOx0SX2kMsn9dX+d+7Kf6h8o4AIykuffjT8L20LU+w4AZd5VvEPY+XpWqLV327HR7DzXuDnD8r+ovkBehJ8i+y8YAAAAASUVORK5CYII=)"
            }
        }
    })
    $.notify.defaults({ autoHide: false, clickToHide: true, style: 'esri'});

    var errorNotifier = function( msg ) {
        $.notify( msg, {className: "error"} );
    }

    var infoNotifier = function( msg ) {
        $.notify( msg, {className: "info", autoHide: true, autoHideDelay: 5000});
    }

    var legend = new Legend({
        autoUpdate: true,
        map: map,
        respectCurrentMapScale: true
    }, 'legend_holder_div');
    legend.startup();

    var legendWidth = 250;
    var legendDividerWidth = 3;
    var handleLegendPopOut = function() {
        $('#overlay').removeClass('selected');
        $('#basemaps').removeClass('selected');
        $('#legend_button').toggleClass('selected');

        //change handler to close the legend
        $("#legend_button").on('click', handleLegendClose);

        var totalWidth = legendWidth + legendDividerWidth;
        var windowWidth = $(window).width();
        setMapWidth((windowWidth - totalWidth));
        setLegendWidth(legendWidth);

        $('.legend_vertical_divider').mousedown(function(e){
            e.preventDefault();
            $('*').css({'cursor':'col-resize'});
            $(document).mousemove(handleLegendResize);
        });
        $(document).mouseup(function(e){
            $(document).unbind('mousemove');
            $('*').css({'cursor':''});
        });
    };

    var handleLegendClose = function() {
        setLegendWidth(0);
        setMapWidth($(window).width());
        $("#legend_button").on('click', handleLegendPopOut);
    };

    var handleLegendResize = function(e){
        var windowWidth = $(window).width();
        var position = e.pageX;
        legendWidth = position - 3;

        setMapWidth(windowWidth - position);
        setLegendWidth(legendWidth);
    };

    var dataDivHeight = 250;
    var dataDivDividerHeight = 3;
    var handleDataDivPopOut = function() {
        $('#overlay').removeClass('selected');
        $('#basemaps').removeClass('selected');
        $('#legend_button').toggleClass('selected');

        //change handler to close the legend
        $("#data_div_button").on('click', handleDataDivClose);

        var totalHeight = dataDivHeight + dataDivDividerHeight;
        var windowHeight = $(window).height();
        setMapHeight(windowHeight - totalHeight);
        setLegendHeight(windowHeight - totalHeight);
        setDataDivHeight(dataDivHeight);

        $('.esri_bottom_horizontal_divider').mousedown(function(e){
            e.preventDefault();
            $('*').css({'cursor':'row-resize'});
            $(document).mousemove(handleDataDivResize);
        });
        $(document).mouseup(function(e){
            $(document).unbind('mousemove');
            $('*').css({'cursor':''});
        });
    };

    var handleDataDivResize = function(e) {
        var windowHeight = $(window).height();
        var position = e.pageY;
        console.log(position);
        dataDivHeight = (windowHeight - position) - 3;

        setMapHeight(position);
        setLegendHeight(position);
        setDataDivHeight(dataDivHeight);
    };

    var handleDataDivClose = function() {
        setDataDivHeight(0);
        setLegendHeight('100%');
        setMapHeight('100%');
        $('#data_div_button').on('click', handleDataDivPopOut);
    };

    var setDataDivHeight = function(height) {
        if(height > 0) {
            $('.esri_bottom_data_div').height(height);
            $('.esri_bottom_horizontal_divider').height(dataDivDividerHeight);
            $('.esri_bottom_horizontal_divider').css('bottom', height+'px');
        } else  {
            $('.esri_bottom_data_div').height(0);
            $('.esri_bottom_horizontal_divider').height(0);
            $('.esri_bottom_horizontal_divider').css('bottom', '0px');
        }
    };

    var setLegendWidth = function(width) {
        $("#legend").width(width);
        $(".legend_vertical_divider").css('left', width+'px');
        if(width > 0) {
            $('.esri_info_div').width(width + legendDividerWidth);
            $('#legend_holder_div').width(width - ($('#legend_holder_div').outerWidth() - $('#legend_holder_div').innerWidth()));
            $(".legend_vertical_divider").width(3);
        } else {
            $('.esri_info_div').width(0);
            $('#legend_holder_div').width(0);
            $(".legend_vertical_divider").width(0);
        }
    };

    var setLegendHeight = function(height) {
        $(".legend_vertical_divider").height(height);
        $("#legend").height(height);
        $('.esri_info_div').height(height);
        if(height === '100%') {
            $('#legend_holder_div').css('max-height', height);
        } else {
            $('#legend_holder_div').css('max-height', height+'px');
        }
    };

    var setMapWidth = function(width) {
        $('#map').width(width);
        map.resize(true);
    };

    var setMapHeight = function(height) {
        $('#map').height(height);
        map.resize(true);
    }

    var handleLayout = function() {
        var windowWidth = $(window).width();
        setMapWidth(windowWidth - $("#legend").width());
    };

    if (OWF.Util.isRunningInOWF()) {
        OWF.ready(function () {
            // see https://developers.arcgis.com/en/javascript/jshelp/ags_proxy.html for options
            //  applicable to your deployment environment
            // Base installation - applying with a JSP available in this app.
            //  However, other options (ASP.NET, PHP) exist
            // TODO: Need means of configuring for the overall application...  Also, dealing with authentication
            esri.config.defaults.io.proxyUrl = "/owf/proxy.jsp";

            OWF.notifyWidgetReady();
            var overlayManager = new OverlayManager(map, errorNotifier, infoNotifier);
            $('#map').on('mouseup', function() {
                $('#popover_overlay_wrapper').hide();
                $('#popover_content_wrapper').hide();
                $('#basemaps').removeClass('selected');
                $('#overlay').removeClass('selected');
                $('#legend_button').removeClass('selected');
                $('#data_div_button').removeClass('selected');
            });

            $('#overlay').on('click', overlayManager.toggleOverlayManager);
            $('#basemaps').on('click', toggleBasemapGallery);
            $("#legend_button").on('click', handleLegendPopOut);
            $('#data_div_button').on('click', handleDataDivPopOut);
            $("[rel=tooltip]").tooltip({ placement: 'bottom'});
       });
    }
});

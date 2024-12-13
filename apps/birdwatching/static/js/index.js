"use strict";

// This will be the object that contains the Vue attributes
// and will be used to initialize the application.
const app = {
    vue: {}
};
app.data = {
    data: function () {
        return {
            map: null,
            heatmap: null,
            drawingManager: null,
            selectedArea: null,
            heatmapData: [],
            searchQuery: "",
            latitude: null,
            longitude: null,
            cheklist_text: "Add Checklist",
            noMarker: true
        };
    },
    methods: {
        load_heatmap_data() {
            fetch(`${heatmap_data_url}?species_name=${encodeURIComponent(this.searchQuery)}`)
                .then((response) => {
                    console.log(response);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then((data) => {
                    const heatmapData = data.data.map((item) => {
                        return {
                            location: new google.maps.LatLng(item.latitude, item.longitude),
                            weight: item.density,
                        };
                    });
                    app.vue.heatmap.setData(heatmapData);
                })
                .catch((error) =>
                    console.error("Error fetching heatmap data:", error)
                );
        },
        add_checklist() {
            if (this.noMarker) {
                this.add_marker();
            } else {
                let self = this;
                axios.post(add_checklist_url, {
                    latitude: self.latitude,
                    longitude: self.longitude,
                }).then(function (r) {
                    window.location.href = `/birdwatching/checklist?c_id=${r.data.c_id}`;
                });

            }
        },
        add_marker() {
            let loc = {};
            let c = app.vue.map.getCenter();
            this.latitude = c.lat();
            this.longitude = c.lng();
            let marker_options = {
                position: { lat: c.lat(), lng: c.lng() },
                map: app.vue.map,
                draggable: true,
            }
            loc.marker = new google.maps.Marker(marker_options);
            loc.marker.addListener('dragend', function () {
                let l = loc.marker.getPosition();
                this.latitude = l.lat();
                this.longitude = l.lng();
            });
            this.noMarker = false
        }
    },
};

// Initialize the map and add drawing functionality
function initMap() {
    navigator.geolocation.getCurrentPosition((position) => {
        // Initialize the map
        app.vue.map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: position.coords.latitude, lng: position.coords.longitude },
            zoom: 8,
        });

        // Initialize DrawingManager
        app.vue.drawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: google.maps.drawing.OverlayType.RECTANGLE,
            drawingControl: true,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [google.maps.drawing.OverlayType.RECTANGLE],
            },
            rectangleOptions: {
                fillColor: "#ffff00",
                fillOpacity: 0.2,
                strokeWeight: 5,
                clickable: false,
                editable: true,
                zIndex: 1,
            },
        });

        // Add DrawingManager to the map
        app.vue.drawingManager.setMap(app.vue.map);

        // Handle rectangle drawing and save coordinates
        google.maps.event.addListener(app.vue.drawingManager, "overlaycomplete", function (event) {
            if (app.vue.selectedArea) {
                app.vue.selectedArea.setMap(null); // Remove previous rectangle
            }
            app.vue.selectedArea = event.overlay; // Store new rectangle

            // Get rectangle bounds
            const bounds = event.overlay.getBounds();
            const ne = bounds.getNorthEast();
            const sw = bounds.getSouthWest();

            // Send coordinates to the backend
            axios.post(save_region_url, {
                ne_lat: ne.lat(),
                ne_lng: ne.lng(),
                sw_lat: sw.lat(),
                sw_lng: sw.lng(),
            }).then(() => {
                alert("Region coordinates saved successfully!");
            }).catch((error) => {
                console.error("Error saving coordinates:", error);
            });
        });
    });
}

window.initMap = initMap;
app.vue = Vue.createApp(app.data).mount("#app");

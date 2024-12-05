"use strict";

// This will be the object that contains the Vue attributes
// and will be used to initialize the application.
let app = {};

// Define Vue data and methods
app.data = {    
    data() {
        return {
            my_value: 1, // Example reactive data
            selectedSpecies: "", // Placeholder for species input
            map: null, // Google Map instance
            heatmap: null, // Heatmap instance
            drawingManager: null, // Drawing Manager instance
            selectedArea: null, // Selected rectangle area
            heatmapData: [], // Data for the heatmap
        };
    },
    methods: {
        incrementValue() {
            this.my_value += 1; // Example method
        },
        fetchStatistics() {
            if (this.selectedArea) {
                const bounds = this.selectedArea.getBounds();
                const ne = bounds.getNorthEast();
                const sw = bounds.getSouthWest();
                alert(`Fetching stats for area: NE(${ne.lat()}, ${ne.lng()}) - SW(${sw.lat()}, ${sw.lng()})`);
            } else {
                alert("Please select an area first!");
            }
        },
        addHeatmapData(points) {
            // Update heatmap data with new points
            this.heatmapData = points.map((point) => new google.maps.LatLng(point.lat, point.lng));
            this.heatmap.setData(this.heatmapData);
        },
    },
    mounted() {
        // Call the global initializeMap function when the component is mounted
        initializeMap();
    },
};

// Mount the Vue application
app.vue = Vue.createApp(app.data).mount("#app");

// Define the global Google Maps initialization function
function initializeMap() {
    // Initialize Google Map
    app.vue.map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 37.7749, lng: -122.4194 }, // Default location: San Francisco
        zoom: 10,
    });

    // Initialize Heatmap Layer
    app.vue.heatmap = new google.maps.visualization.HeatmapLayer({
        data: app.vue.heatmapData,
        map: app.vue.map,
        radius: 20, // Adjust heatmap point radius
    });

    // Initialize Drawing Manager
    app.vue.drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.RECTANGLE,
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [google.maps.drawing.OverlayType.RECTANGLE],
        },
        rectangleOptions: {
            fillColor: "#FF0000",
            fillOpacity: 0.35,
            strokeWeight: 2,
            clickable: false,
            editable: true,
            zIndex: 1,
        },
    });

    app.vue.drawingManager.setMap(app.vue.map);

    // Handle rectangle creation
    google.maps.event.addListener(
        app.vue.drawingManager,
        "overlaycomplete",
        (event) => {
            if (event.type === google.maps.drawing.OverlayType.RECTANGLE) {
                if (app.vue.selectedArea) {
                    app.vue.selectedArea.setMap(null); // Clear previous rectangle
                }
                app.vue.selectedArea = event.overlay;
                const bounds = app.vue.selectedArea.getBounds();
                console.log("Selected Area Bounds:", bounds.toString());
            }
        }
    );
}

// Example external data load function for heatmap points
app.load_heatmap_data = function () {
    // Replace with a real API call to fetch heatmap data
    axios.get(my_callback_url).then((response) => {
        const points = response.data.points; // Assume the API returns an array of {lat, lng}
        app.vue.addHeatmapData(points);
    });
};

// Load heatmap data
app.load_heatmap_data();

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
        // },
        // addHeatmapData(points) {
        //     // Update heatmap with weighted points
        //     this.heatmapData = points;
        //     this.heatmap.setData(this.heatmapData);
        }
    },
    mounted() {
        app.load_heatmap_data();
    },
};

// Mount the Vue application
app.vue = Vue.createApp(app.data).mount("#app");

// Example external data load function for heatmap points
app.load_heatmap_data = function () {
    // axios.get(heatmap_data_url).then((response) => {
    //     const points = response.data.map((record) => ({
    //         location: new google.maps.LatLng(record.latitude, record.longitude),
    //         weight: record.density, // Use 'density' to weight the heatmap points
    //     }));
    //     app.vue.addHeatmapData(points);
    // }).catch((error) => {
    //     console.error("Error loading heatmap data:", error);
    // });
    /* Data points defined as a mixture of WeightedLocation and LatLng objects */
    var heatMapData = [
        {location: new google.maps.LatLng(37.782, -122.447), weight: 0.5},
        new google.maps.LatLng(37.782, -122.445),
        {location: new google.maps.LatLng(37.782, -122.443), weight: 2},
        {location: new google.maps.LatLng(37.782, -122.441), weight: 3},
        {location: new google.maps.LatLng(37.782, -122.439), weight: 2},
        new google.maps.LatLng(37.782, -122.437),
        {location: new google.maps.LatLng(37.782, -122.435), weight: 0.5},
    
        {location: new google.maps.LatLng(37.785, -122.447), weight: 3},
        {location: new google.maps.LatLng(37.785, -122.445), weight: 2},
        new google.maps.LatLng(37.785, -122.443),
        {location: new google.maps.LatLng(37.785, -122.441), weight: 0.5},
        new google.maps.LatLng(37.785, -122.439),
        {location: new google.maps.LatLng(37.785, -122.437), weight: 2},
        {location: new google.maps.LatLng(37.785, -122.435), weight: 3}
    ];
    var heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatMapData
    });
    heatmap.setMap(map);
};

// Load heatmap data
app.load_heatmap_data();

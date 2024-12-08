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
            // Update heatmap with weighted points
            this.heatmapData = points;
            if (this.heatmap) {
                this.heatmap.setData(this.heatmapData);
            }
        },
        load_heatmap_data() {
            axios.get(heatmap_data_url).then((response) => {
                const points = response.data.map((record) => ({
                    location: new google.maps.LatLng(record.latitude, record.longitude),
                    weight: record.density, // Use 'density' to weight the heatmap points
                }));
                console.log("Heatmap data loaded:", points);
                this.addHeatmapData(points);
            }).catch((error) => {
                console.error("Error loading heatmap data:", error);
            });
        },
    },
    mounted() {
        this.load_heatmap_data(); // Use `this` to call the method within Vue's context
    },
};

// Mount the Vue application
app.vue = Vue.createApp(app.data).mount("#app");

"use strict";

// This will be the object that contains the Vue attributes
// and will be used to initialize the application.
const app = {
    vue: {}
};
app.data = {
    data() {
        return {
            map: null,
            heatmap: null,
            drawingManager: null,
            selectedArea: null,
            heatmapData: [],
            searchQuery: "",
            latitude: null,
            longitude: null,
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
    },
};

app.vue = Vue.createApp(app.data).mount("#app");
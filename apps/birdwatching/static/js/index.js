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
            cheklist_text: "Add Checklist",
            noMarker: true
        };
    },
    methods: {
        load_heatmap_data() {
            fetch(`${heatmap_data_url}?species_name=${encodeURIComponent(this.searchQuery)}`)
            .then((response) => {
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
                position: {lat: c.lat(), lng: c.lng()},
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

app.vue = Vue.createApp(app.data).mount("#app");

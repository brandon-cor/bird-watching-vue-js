app.data = {
    data() {
        return {
            map: null,
            heatmap: null,
            drawingManager: null,
            selectedArea: null,
            heatmapData: [],
            selectedSpecies: "",
        };
    },
    methods: {
        load_heatmap_data() {
            axios
                .get(heatmap_data_url)
                .then((response) => {
                    const data = response.data.data || [];
                    if (Array.isArray(data)) {
                        const points = data.map((record) => ({
                            location: new google.maps.LatLng(record.latitude, record.longitude),
                            weight: record.density,
                        }));
                        this.heatmapData = points; 
                        if (this.heatmap) {
                            this.heatmap.setData(this.heatmapData);
                        }
                    } else {
                        console.error("Unexpected data format:", data);
                    }
                })
                .catch((error) => {
                    console.error("Error fetching heatmap data:", error);
                });
        },
    },
};

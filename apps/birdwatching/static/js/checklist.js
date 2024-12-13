"use strict";

// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};


app.data = {    
    data: function() {
        return {
            checklist: [],
            date: null,
            start_time: null,
            duration: null,
            query: "",
            search_results: [],

        };
    },
    methods: {
        search: function () {
            let self = this;
            if (this.query.length > 0) {
                // axios.post(get_checklist_url, {
                //     query: self.query,
                // }).then(function (r) {
                //     app.vue.species = r.data.species;
                // });
                axios.get(search_species_url, {params: {q: app.vue.query}})
                .then(function (r) {
                    self.search_results = r.data.species;
                });
            } else {
                self.search_results = [];
            }
        }
    },
    // mounted: {
    //     // this.fetchSpecies();
    //     // this.initialTimestamp = new Date();
    //     // // Call saveTimestamp here if you want to save it as soon as the app is loaded
    //     // this.saveTimestamp(this.initialTimestamp.toISOString());
    //     urlParams = new URLSearchParams(window.location.search)
    //     this.lat = urlParams.get('lat');
    //     this.lng = urlParams.get('lng');
    //     // Use lat, lng as needed in your app
    //     console.log(`Latitude: ${this.lat}, Longitude: ${this.lng}`);
    // },
};

app.vue = Vue.createApp(app.data).mount("#app");

app.load_data = function () {
    let urlParams = new URLSearchParams(window.location.search)
    axios.post(get_checklist_url, {
        sample_id: urlParams.get('c_id'),
    }).then(function (r) {
        app.vue.checklist = r.data.list;
        if (r.data.list.length > 0) {
            app.vue.date = r.data.list[0].observation_date;
            app.vue.start_time = r.data.list[0].start_time;
            app.vue.duration = r.data.list[0].duration_minutes;
        } else {
            alert("Error: You do not have permission to edit this checklist");
            window.location.href = `/birdwatching/index`;
        }
    });
    
    
    
}

app.load_data();


"use strict";

// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};


app.data = {    
    data: function() {
        return {
            // Complete as you see fit.
            checklist_id: null, // This is an example.
            from_url: null,
            checklist: [],
            date: null,
            start_time: null,
            duration: null,

        };
    },
    methods: {
        // Complete as you see fit.
        my_function: function() {
            // This is an example.
            this.my_value += 1;
        },
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
    app.vue.from_url = urlParams.get('c_id');
    axios.post(get_checklist_url, {
        sample_id: urlParams.get('c_id'),
    }).then(function (r) {
        app.vue.checklist = r.data.list;
        app.vue.date = r.data.list[0].observation_date;
        app.vue.start_time = r.data.list[0].start_time;
        app.vue.duration = r.data.list[0].duration_minutes;
    });
    
}

app.load_data();


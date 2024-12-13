"use strict";

// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};


app.data = {    
    data: function() {
        return {
            checklists: [],

        };
    },
    methods: {
        delete_checklist: function(sample_id, index) {

            let self = this;
            axios.post(delete_checklist_url, {
                sample_id: sample_id,
            }).then(function (r) {
                self.checklists.splice(index, 1);
            });
    
        },
        edit: function(sample_id) {
            window.location.href = `/birdwatching/checklist?c_id=${sample_id}`;
        }
        
    },
    
};

app.vue = Vue.createApp(app.data).mount("#app");

app.load_data = function () {
    axios.get(load_checklists_url).then(function (r) {
        app.vue.checklists = r.data.checklists;
    });
}

app.load_data();
new Vue({
    el: "#stats",
    data: {
      speciesStats: [], // List of all species seen
      speciesTrends: [], // Trends data for a specific species
      searchQuery: "", // Search box input
      speciesSearchResults: [], // Search results
      selectedSpecies: null, // Currently selected species
      chart: null, // Chart.js instance
    },
    methods: {
      fetchStats() {
        axios.get("/get_user_stats").then((response) => {
          this.speciesStats = response.data.stats;
        });
      },
      fetchTrends(species) {
        this.selectedSpecies = species;
        axios.get(`/get_species_trends?species=${species}`).then((response) => {
          this.speciesTrends = response.data.trends;
          this.plotTrends();
        });
      },
      searchSpecies() {
        axios.get(`/search_species?q=${this.searchQuery}`).then((response) => {
          this.speciesSearchResults = response.data.species;
        });
      },
      plotTrends() {
        if (this.chart) this.chart.destroy();
        const ctx = document.getElementById("trendsChart").getContext("2d");
        const labels = this.speciesTrends.map((t) => t.observation_date);
        const data = this.speciesTrends.map((t) => t.count);
        this.chart = new Chart(ctx, {
          type: "line",
          data: {
            labels: labels,
            datasets: [
              {
                label: `Observations of ${this.selectedSpecies}`,
                data: data,
                borderColor: "blue",
                fill: false,
              },
            ],
          },
        });
      },
    },
    mounted() {
      this.fetchStats();
    },
  });
  
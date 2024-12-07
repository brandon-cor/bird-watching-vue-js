new Vue({
  el: "#app", // Target the #app div in the HTML
  data: {
    userStats: [], // Holds stats from the backend
    searchQuery: "", // Holds the search term
    showTrends: false, // Toggles trend chart visibility
    selectedSpecies: "", // Name of the selected species
    trendData: [], // Holds trends for the selected species
  },
  computed: {
    filteredStats() {
      // Dynamically filter species based on search query
      return this.userStats.filter(stat =>
        stat.common_name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  methods: {
    async fetchUserStats() {
      try {
        const response = await axios.get("/birdwatching/get_user_stats");
        this.userStats = response.data.stats; // Update the stats data
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    },
    async fetchTrends(speciesName) {
      try {
        const response = await axios.get("/birdwatching/get_species_trends", {
          params: { species: speciesName },
        });
        this.trendData = response.data.trends; // Update trend data
        this.selectedSpecies = speciesName; // Update selected species name
        this.showTrends = true; // Show the trend chart
        this.plotTrends(); // Plot the trend data
      } catch (error) {
        console.error("Error fetching trends:", error);
      }
    },
    plotTrends() {
      this.$nextTick(() => {

        // Check if a chart already exists for this canvas and destroy it
        const existingChart = Chart.getChart("trendChart");
        if (existingChart) {
          existingChart.destroy();
        }
        
        const ctx = document.getElementById("trendChart").getContext("2d");

        new Chart(ctx, {
          type: "line",
          data: {
            labels: this.trendData.map(t => t.observation_date), // X-axis: dates
            datasets: [
              {
                label: `Sightings of ${this.selectedSpecies}`,
                data: this.trendData.map(t => t.count), // Y-axis: counts
                fill: false,
                borderColor: "blue",
                tension: 0.1,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                display: true,
              },
            },
            scales: {
              x: { title: { display: true, text: "Date" } },
              y: { title: { display: true, text: "Sightings Count" } },
            },
          },
        });
      });
    },    
  },
  mounted() {
    // Fetch user stats when the page loads
    this.fetchUserStats();
  },
});

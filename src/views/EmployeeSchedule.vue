<template>
  <div class="horario-container">
    <h1><i class="fas fa-calendar-alt"></i> Mi Horario</h1>

    <ul class="horario-list">
      <li v-for="item in schedule" :key="item._id" class="horario-item">
        <div v-if="item.flight" class="horario-info">
          <i class="fas fa-plane-departure text-blue"></i>
          <strong>{{ item.flight.flightNumber }}</strong> &nbsp;|&nbsp;
          <i class="fas fa-map-marker-alt text-green"></i> {{ item.flight.origin }} →
          <i class="fas fa-map-marker text-red"></i> {{ item.flight.destination }} &nbsp;|&nbsp;
          <i class="fas fa-clock text-gray"></i> {{ formatDate(item.flight.departureTime) }} -
          {{ formatDate(item.flight.arrivalTime) }}
        </div>
      </li>
    </ul>

    <p v-if="error" class="error-text"><i class="fas fa-exclamation-circle"></i> {{ error }}</p>
  </div>
</template>

<script>
export default {
  name: 'EmployeeScheduleView',
  data() {
    return {
      schedule: [],
      error: ''
    }
  },
  methods: {
    async fetchSchedule() {
      try {
        const token = this.$store.state.token;
        const { data } = await this.$axios.get(
          'https://airline-management-backend-bus7.onrender.com/api/employee/schedule',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.schedule = data;
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al obtener el horario';
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString('es-MX', {
        dateStyle: 'short',
        timeStyle: 'short'
      });
    }
  },
  created() {
    this.fetchSchedule();
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

.horario-container {
  padding: 2rem;
  background-color: #f9f9fb;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', sans-serif;
}

h1 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.horario-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.horario-item {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #ffffff;
  border-left: 5px solid #2980b9;
  border-radius: 6px;
  transition: transform 0.2s ease;
}

.horario-item:hover {
  transform: scale(1.01);
}

.horario-info {
  font-size: 1rem;
  color: #34495e;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.error-text {
  color: #e74c3c;
  margin-top: 1.5rem;
  font-weight: 500;
}

.text-blue {
  color: #2980b9;
}

.text-green {
  color: #27ae60;
}

.text-red {
  color: #e74c3c;
}

.text-gray {
  color: #7f8c8d;
}
</style>

<template>
  <div class="reservations-container">
    <h1><i class="fas fa-ticket-alt"></i> Mis Reservaciones</h1>

  <div v-if="loading" class="loading-container">
    <div class="loader"></div>
    <p class="loading-text">Cargando reservaciones...</p>
  </div>
<div v-else>


    <div class="buttons-top">
      <button @click="fetchReservations" class="btn-refresh">
        <i class="fas fa-sync-alt"></i> Actualizar Reservaciones
      </button>
      <button @click="resetFilters" class="btn-clear">
        <i class="fas fa-broom"></i> Limpiar Filtros
      </button>
    </div>

    <!-- Filtros -->
    <div class="filters">
      <input v-model="filters.origin" placeholder="Origen" />
      <input v-model="filters.destination" placeholder="Destino" />
      <select v-model="filters.status">
        <option value="">Estado de reservación</option>
        <option value="confirmed">Confirmada</option>
        <option value="cancelled">Cancelada</option>
      </select>     
      <select v-model="filters.flightStatus">
        <option value="">Estado del vuelo</option>
        <option value="scheduled">Scheduled</option>
        <option value="delayed">Delayed</option>
        <option value="cancelled">Cancelled</option>
        <option value="departed">Departed</option>
        <option value="arrived">Arrived</option>
      </select>
      <input v-model="filters.dateFrom" type="date" />
      <input v-model="filters.dateTo" type="date" />
    </div>
</div>
    <div v-if="filteredReservations.length > 0" class="cards">
      <div v-for="reservation in filteredReservations" :key="reservation._id" class="card">
        <h2><i class="fas fa-plane-departure"></i> {{ reservation.flight.flightNumber }}</h2>
        <p><i class="fas fa-chair"></i> <strong>Asiento:</strong> {{ reservation.seatNumber }}</p>
        <p><i class="fas fa-info-circle"></i> <strong>Estado:</strong> {{ reservation.status }}</p>
        <p><i class="fas fa-calendar-plus"></i> <strong>Fecha reservación:</strong> {{ formatDate(reservation.createdAt) }}</p>

        <hr />

        <p><i class="fas fa-route"></i> <strong>Ruta:</strong> {{ reservation.flight.origin }} ➔ {{ reservation.flight.destination }}</p>
        <p><i class="fas fa-clock"></i> <strong>Salida:</strong> {{ formatDateTime(reservation.flight.departureTime) }}</p>
        <p><i class="fas fa-clock"></i> <strong>Llegada:</strong> {{ formatDateTime(reservation.flight.arrivalTime) }}</p>
        <p><i class="fas fa-plane"></i> <strong>Aeronave:</strong> {{ reservation.flight.aircraft.model }}</p>
        <p><i class="fas fa-signal"></i> <strong>Estado del vuelo:</strong> {{ reservation.flight.status }}</p>

        <button v-if="reservation.status === 'confirmed'" @click="cancelReservation(reservation._id)" class="btn-cancel">
          <i class="fas fa-times-circle"></i> Cancelar
        </button>
      </div>
    </div>

    <p v-else-if="error" class="error-msg"><i class="fas fa-exclamation-triangle"></i> {{ error }}</p>
    <p v-else class="no-data"><i class="fas fa-info-circle"></i> No hay reservaciones disponibles.</p>
  </div>
  <!-- botones, filtros y lista -->

</template>

<script>
export default {
  name: 'ReservationsView',
  data() {
    return {
      reservations: [],
      error: '',
      filters: {
        status: '',
        origin: '',
        destination: '',
        dateFrom: '',
        dateTo: '',
        flightStatus: '',
        loading: true,
      }
    }
  },
  computed: {
    filteredReservations() {
      return this.reservations.filter(res => {
        const { status, origin, destination, dateFrom, dateTo, flightStatus } = this.filters;
        const createdDate = new Date(res.createdAt);
        const from = dateFrom ? new Date(dateFrom) : null;
        const to = dateTo ? new Date(dateTo) : null;

        return (
          (!status || res.status === status) &&
          (!origin || res.flight.origin.toLowerCase().includes(origin.toLowerCase())) &&
          (!destination || res.flight.destination.toLowerCase().includes(destination.toLowerCase())) &&
          (!flightStatus || res.flight.status === flightStatus) &&
          (!from || createdDate >= from) &&
          (!to || createdDate <= to)
        );
      });
    }
  },
  methods: {
    async fetchReservations() {
      this.loading = true;
      try {
        const token = localStorage.getItem('token');
        console.log('🔍 Token recuperado:', token);
        const response = await this.$axios.get('https://airline-management-backend-bus7.onrender.com/api/reservations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.reservations = response.data;
        this.error = '';
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al obtener reservaciones';
        this.reservations = [];
      }
      finally {
        this.loading = false;
      }
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString();
    },
    formatDateTime(dateStr) {
      return new Date(dateStr).toLocaleString();
    },
    async cancelReservation(id) {
      if (!confirm('¿Seguro que deseas cancelar esta reservación?')) return;

      try {
        const token = localStorage.getItem('token');
        await this.$axios.put(`https://airline-management-backend-bus7.onrender.com/api/reservations/${id}/cancel`, null, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Reservación cancelada');
        await this.fetchReservations();
      } catch (error) {
        console.error('❌ Error al cancelar la reservación:', error.response?.data || error.message);
        alert(error.response?.data?.message || 'Error al cancelar reservación');
      }
    },
    resetFilters() {
      this.filters = {
        status: '',
        origin: '',
        destination: '',
        dateFrom: '',
        dateTo: '',
        flightStatus: ''
      };
    }
  },
  created() {
    this.fetchReservations();
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

.reservations-container {
  padding: 2rem;
  font-family: Arial, sans-serif;
  background: #f9f9f9;
}

h1 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: #333;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

.filters input,
.filters select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.95rem;
}

.cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.card {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  flex: 1 1 calc(33% - 1rem);
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.card h2 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #0066cc;
}

.card p {
  margin: 0.3rem 0;
}

.card hr {
  margin: 1rem 0;
  border: none;
  border-top: 1px solid #eee;
}

.buttons-top {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.btn-refresh,
.btn-clear {
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-refresh {
  background-color: #007bff;
  color: white;
}

.btn-refresh:hover {
  background-color: #0056b3;
}

.btn-clear {
  background-color: #6c757d;
  color: white;
}

.btn-clear:hover {
  background-color: #5a6268;
}

.btn-cancel {
  background-color: #dc3545;
  color: white;
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 0.8rem;
  width: 100%;
}

.btn-cancel:hover {
  background-color: #b02a37;
}

.error-msg {
  color: red;
  font-weight: bold;
  margin-top: 1rem;
}

.no-data {
  color: #555;
  margin-top: 1rem;
}
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  text-align: center;
}

.loader {
  border: 6px solid #e0e0e0;
  border-top: 6px solid #007bff; /* color azul */
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 1.1rem;
  color: #444;
  font-weight: 500;
}

</style>

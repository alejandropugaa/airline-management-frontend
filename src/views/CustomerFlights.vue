<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Vuelos disponibles</h1>

    <!-- Filtros -->
   <div class="filters">
  <input v-model="filters.origin" placeholder="Origen" class="filter-input" />
  <input v-model="filters.destination" placeholder="Destino" class="filter-input" />
  <select v-model="filters.status" class="filter-input">
    <option value="">Estado</option>
    <option value="scheduled">Scheduled</option>
    <option value="delayed">Delayed</option>
    <option value="cancelled">Cancelled</option>
    <option value="departed">Departed</option>
    <option value="arrived">Arrived</option>
  </select>
  <input v-model="filters.dateFrom" type="date" class="filter-input" />
  <input v-model="filters.dateTo" type="date" class="filter-input" />

  <button @click="resetFilters" class="btn-clear">
    <i class="fas fa-broom"></i> Limpiar Filtros
  </button>
</div>

    <div v-if="loading" class="loading-container">
      <div class="loader"></div>
      <p class="loading-text">Cargando vuelos disponibles...</p>
    </div>

    <div v-else-if="filteredFlights.length === 0">No hay vuelos disponibles.</div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
<div v-for="flight in filteredFlights" :key="flight._id" class="card">
  <h2 class="flight-title">
    <i class="fas fa-plane-departure"></i> Vuelo: {{ flight.flightNumber }}
  </h2>

  <div class="info">
    <p><i class="fas fa-jet-fighter-up"></i> <strong>Avión:</strong> {{ flight.aircraft?.model || 'Desconocido' }}</p>
    <p><i class="fas fa-location-dot"></i> <strong>Origen:</strong> {{ flight.origin }}</p>
    <p><i class="fas fa-map-marker-alt"></i> <strong>Destino:</strong> {{ flight.destination }}</p>
    <p><i class="fas fa-clock"></i> <strong>Salida:</strong> {{ formatDate(flight.departureTime) }}</p>
    <p><i class="fas fa-hourglass-end"></i> <strong>Llegada:</strong> {{ formatDate(flight.arrivalTime) }}</p>
    <p><i class="fas fa-circle-info"></i> <strong>Estado:</strong> {{ flight.status }}</p>
  </div>

  <div class="price-info">
    <p><i class="fas fa-dollar-sign"></i> <strong>Precio original:</strong> ${{ (flight.price || 500).toFixed(2) }}</p>
    <template v-if="customer?.frequentFlyer?.status && customer.frequentFlyer.status !== 'none'">
      <p><i class="fas fa-tags"></i> <strong>Descuento ({{ customer.frequentFlyer.status }}):</strong> -${{ calculateDiscount(flight.price || 500, customer.frequentFlyer.status).toFixed(2) }}</p>
      <p><i class="fas fa-money-bill-wave"></i> <strong>Precio final:</strong> ${{ ((flight.price || 500) - calculateDiscount(flight.price || 500, customer.frequentFlyer?.status)).toFixed(2) }}</p>
    </template>
  </div>

  <!-- Mensajes según el estado del vuelo -->
  <div v-if="flight.status === 'cancelled'" class="text-red font-bold mt-2">
    <i class="fas fa-ban"></i> Vuelo cancelado, no es posible reservar.
  </div>

  <div v-else-if="flight.status === 'arrived'" class="text-blue-700 font-bold mt-2">
    <i class="fas fa-circle-check"></i> Este vuelo ya ha llegado, no se puede reservar.
  </div>

  <!-- Formulario de reservación si está permitido -->
  <div v-else>
    <div v-if="availableSeats[flight._id]?.length">
      <label class="label"><i class="fas fa-chair"></i> Asiento:</label>
      <select v-model="selectedSeats[flight._id]" class="input">
        <option disabled value="">Selecciona un asiento</option>
        <option v-for="seat in availableSeats[flight._id]" :key="seat" :value="seat">{{ seat }}</option>
      </select>
    </div>
    <div v-else class="text-red"><i class="fas fa-ban"></i> No hay asientos disponibles</div>

    <label class="label"><i class="fas fa-credit-card"></i> Método de pago:</label>
    <select v-model="selectedPaymentMethods[flight._id]" class="input">
      <option disabled value="">Selecciona método</option>
      <option v-for="method in paymentMethods" :key="method" :value="method">
        {{ method === 'credit_card' ? 'Tarjeta de crédito' :
           method === 'debit_card' ? 'Tarjeta de débito' :
           method === 'paypal' ? 'PayPal' : 'Efectivo' }}
      </option>
    </select>

    <button
      @click="reserveFlight(flight._id)"
      class="btn"
      :disabled="!selectedSeats[flight._id] || !selectedPaymentMethods[flight._id]"
    >
      <i class="fas fa-check-circle"></i> Reservar
    </button>
  </div>
</div>


    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      flights: [],
      customer: null,
      loading: true,
      selectedSeats: {},
      availableSeats: {},
      selectedPaymentMethods: {},
      paymentMethods: ['credit_card', 'debit_card', 'paypal', 'cash'],
      filters: {
        origin: '',
        destination: '',
        status: '',
        dateFrom: '',
        dateTo: '',
      },
    };
  },
  computed: {
    filteredFlights() {
      return this.flights.filter(f => {
        const { origin, destination, status, dateFrom, dateTo } = this.filters;

        const matchOrigin = !origin || f.origin.toLowerCase().includes(origin.toLowerCase());
        const matchDestination = !destination || f.destination.toLowerCase().includes(destination.toLowerCase());
        const matchStatus = !status || f.status === status;

        const departure = new Date(f.departureTime);
        const matchFrom = !dateFrom || departure >= new Date(dateFrom);
        const matchTo = !dateTo || departure <= new Date(dateTo);

        return matchOrigin && matchDestination && matchStatus && matchFrom && matchTo;
      });
    }
  },
  methods: {
    resetFilters() {
      this.filters = {
        origin: '',
        destination: '',
        status: '',
        dateFrom: '',
        dateTo: '',
      };
    },
    async fetchCustomer() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          this.customer = { frequentFlyer: { status: 'none', points: 0 } };
          return;
        }
        const response = await this.$axios.get('https://airline-management-backend-bus7.onrender.com/api/customers/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.customer = response.data;
      } catch (error) {
        this.customer = { frequentFlyer: { status: 'none', points: 0 } };
      }
    },
    async fetchFlights() {
      try {
        const token = localStorage.getItem('token');
        const response = await this.$axios.get('https://airline-management-backend-bus7.onrender.com/api/flights', {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.flights = response.data;
        for (const flight of this.flights) {
          await this.fetchAvailableSeats(flight);
        }
      } finally {
        this.loading = false;
      }
    },
    async fetchAvailableSeats(flight) {
      const token = localStorage.getItem('token');
      try {
        const response = await this.$axios.get(`https://airline-management-backend-bus7.onrender.com/api/reservations/occupied/${flight._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const occupiedSeats = response.data;
        const fullSeatMap = flight.aircraft?.seatMap || this.generateSeatMap();
        this.availableSeats[flight._id] = fullSeatMap.filter(seat => !occupiedSeats.includes(seat));
      } catch (error) {
        this.availableSeats[flight._id] = [];
      }
    },
    generateSeatMap() {
      const rows = 20;
      const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
      const seatMap = [];
      for (let i = 1; i <= rows; i++) {
        for (let letter of letters) {
          seatMap.push(`${i}${letter}`);
        }
      }
      return seatMap;
    },
    formatDate(dateStr) {
      return dateStr ? new Date(dateStr).toLocaleString() : '-';
    },
    calculateDiscount(price, status) {
      const discounts = {
        platinum: 0.10,
        gold: 0.05,
        silver: 0.02,
      };
      return (discounts[status] || 0) * price;
    },
    async reserveFlight(flightId) {
      const seat = this.selectedSeats[flightId];
      const paymentMethod = this.selectedPaymentMethods[flightId];
      if (!seat || !paymentMethod) return;
      try {
        const token = localStorage.getItem('token');
        const response = await this.$axios.post(
          'https://airline-management-backend-bus7.onrender.com/api/reservations',
          {
            flight: flightId,
            seatNumber: seat,
            paymentMethod,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert(`Reservación creada. Precio: $${response.data.payment.amount.toFixed(2)}`);
        this.selectedSeats[flightId] = '';
        this.selectedPaymentMethods[flightId] = '';
        await this.fetchAvailableSeats(this.flights.find(f => f._id === flightId));
      } catch (error) {
        alert(error.response?.data?.message || 'Error al reservar');
      }
    },
  },
  async mounted() {
    await this.fetchCustomer();
    await this.fetchFlights();
  },
};
</script>

<style scoped>
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  align-items: center;
}

.filter-input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.95rem;
  min-width: 160px;
  flex: 1;
  max-width: 200px;
}

.btn-clear {
  background-color: #6c757d;
  color: white;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-clear:hover {
  background-color: #5a6268;
}


.card {
  border: 1px solid #ccc;
  padding: 1.5rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;
}
.card:hover {
  transform: translateY(-3px);
}
.flight-title {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #1d4ed8;
}
.info p,
.price-info p {
  margin: 0.35rem 0;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 8px;
}
.label {
  margin-top: 1rem;
  font-weight: 600;
  display: block;
  color: #333;
}
.input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #bbb;
  border-radius: 6px;
  font-size: 0.95rem;
  margin-top: 0.3rem;
}
.btn {
  margin-top: 1rem;
  background-color: #2563eb;
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.3s ease;
}
.btn:hover {
  background-color: #1e40af;
  transform: translateY(-2px);
}
.btn:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}
.text-red {
  color: #dc2626;
  margin-top: 0.5rem;
}
.text-blue-700 {
  color: #1e3a8a;
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
  border-top: 6px solid #2563eb; /* azul animado */
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

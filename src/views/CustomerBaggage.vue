<template>
  <div class="p-4">
    <h2 class="text-2xl font-bold mb-6">
      <i class="fas fa-suitcase-rolling"></i> Check-in & Equipaje
    </h2>

    <p v-if="error" class="text-red-500 mb-4"><i class="fas fa-exclamation-circle"></i> {{ error }}</p>
    <p v-if="loading" class="mb-4"><i class="fas fa-spinner fa-spin"></i> Cargando...</p>

    <!-- Filtros -->
    <div class="mb-6 p-4 bg-gray-100 rounded flex flex-wrap gap-4 items-center">
      <input v-model="filtroVuelo" placeholder="N° Vuelo" class="p-2 border rounded w-48" />
      <input v-model="filtroOrigen" placeholder="Origen" class="p-2 border rounded w-40" />
      <input v-model="filtroDestino" placeholder="Destino" class="p-2 border rounded w-40" />
      <input type="date" v-model="filtroFecha" class="p-2 border rounded" />
      <select v-model="filtroEstado" class="p-2 border rounded">
        <option value="">Todos</option>
        <option value="pendiente">Sin Check-in</option>
        <option value="completado">Con Check-in</option>
      </select>
      <input v-model="filtroBoardingPass" placeholder="Pase de abordar" class="p-2 border rounded w-64" />
      <button @click="limpiarFiltros" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
  <i class="fas fa-eraser"></i> Limpiar filtros
</button>

    </div>

    <div v-for="res in reservasFiltradas" :key="res._id" class="reservation-card">
      <div class="reservation-header">
        <div>
          <p><i class="fas fa-plane"></i> <strong>Vuelo:</strong> {{ res.flight.flightNumber }} — {{ res.flight.origin }} → {{ res.flight.destination }}</p>
          <p><i class="fas fa-clock"></i> <strong>Salida:</strong> {{ formatDate(res.flight.departureTime) }}</p>
          <p><i class="fas fa-chair"></i> <strong>Asiento:</strong> {{ res.seatNumber }}</p>
        </div>
        <div>
          <button
            v-if="res.status === 'confirmed' && !baggageMap[res._id]"
            @click="openCheckinForm(res._id)"
            class="bg-green-500 text-white px-4 py-2 rounded"
          >
            <i class="fas fa-plane-departure"></i> Hacer Check-in
          </button>
        </div>
      </div>

      <div v-if="activeCheckin === res._id" class="mt-4 p-4 bg-gray-50 rounded">
        <h4 class="font-semibold mb-2"><i class="fas fa-box-open"></i> Check-in Equipaje</h4>
        <div class="mb-2">
          <label class="block mb-1"><i class="fas fa-weight-hanging"></i> Peso (kg):</label>
          <input type="number" v-model.number="checkinForm.weight" class="w-32 p-2 border rounded" />
          <p v-if="checkinForm.weight > 20" class="text-yellow-600 mt-2">
            <i class="fas fa-exclamation-triangle"></i> Cargo extra por exceso de peso: <strong>${{ extraCharge }}</strong>
          </p>
        </div>
        <div class="mb-2" v-if="hasExtraCharge">
          <label class="block mb-1"><i class="fas fa-money-check-alt"></i> Método de pago:</label>
          <select v-model="checkinForm.method" class="w-40 p-2 border rounded">
            <option disabled value="">Selecciona</option>
            <option value="credit_card">Tarjeta de crédito</option>
            <option value="debit_card">Tarjeta de débito</option>
            <option value="paypal">PayPal</option>
            <option value="cash">Efectivo</option>
          </select>
        </div>

        <button @click="submitCheckin(res._id)" class="bg-blue-600 text-white px-4 py-2 rounded">
          <i class="fas fa-check-circle"></i> Confirmar Check-in
        </button>
        <button @click="cancelCheckin" class="ml-2 text-gray-600">
          <i class="fas fa-times-circle"></i> Cancelar
        </button>
      </div>

      <div v-if="baggageMap[res._id]" class="mt-4 border-t pt-4">
        <h4 class="font-semibold mb-2"><i class="fas fa-luggage-cart"></i> Equipaje Registrado</h4>
        <p><i class="fas fa-ticket-alt"></i> <strong>Boarding Pass:</strong> {{ baggageMap[res._id].boardingPass }}</p>
        <p><i class="fas fa-weight-hanging"></i> <strong>Peso:</strong> {{ baggageMap[res._id].weight }} kg</p>
        <p><i class="fas fa-dollar-sign"></i> <strong>Cargo extra:</strong> ${{ baggageMap[res._id].extraCharge }}</p>
        <p><i class="fas fa-info-circle"></i> <strong>Estado:</strong> {{ baggageMap[res._id].status }}</p>
      </div>
    </div>

    <p v-if="!loading && !reservasFiltradas.length" class="text-gray-600">
      <i class="fas fa-info-circle"></i> No tienes reservaciones confirmadas.
    </p>
  </div>
</template>

<script>
export default {
  name: 'CustomerBaggage',
  data() {
    return {
      reservations: [],
      baggageMap: {},
      activeCheckin: null,
      checkinForm: { weight: 0, method: '' },
      loading: false,
      error: '',
      filtroVuelo: '',
      filtroOrigen: '',
      filtroDestino: '',
      filtroFecha: '',
      filtroEstado: '',
      filtroBoardingPass: ''
    };
  },
  computed: {
    extraCharge() {
      const baseLimit = 20;
      const extraPerKg = 10;
      const extraWeight = Math.max(0, this.checkinForm.weight - baseLimit);
      return extraWeight * extraPerKg;
    },
    hasExtraCharge() {
      return this.checkinForm.weight > 20;
    },
    reservasFiltradas() {
      return this.reservations.filter(res => {
        const vuelo = res.flight.flightNumber.toLowerCase();
        const origen = res.flight.origin.toLowerCase();
        const destino = res.flight.destination.toLowerCase();
        const fecha = new Date(res.flight.departureTime).toISOString().split('T')[0];
        const boardingPass = this.baggageMap[res._id]?.boardingPass?.toLowerCase() || '';
        const tieneCheckin = !!this.baggageMap[res._id];

        return (
          vuelo.includes(this.filtroVuelo.toLowerCase()) &&
          origen.includes(this.filtroOrigen.toLowerCase()) &&
          destino.includes(this.filtroDestino.toLowerCase()) &&
          (this.filtroFecha === '' || fecha === this.filtroFecha) &&
          (this.filtroEstado === '' ||
            (this.filtroEstado === 'pendiente' && !tieneCheckin) ||
            (this.filtroEstado === 'completado' && tieneCheckin)) &&
          boardingPass.includes(this.filtroBoardingPass.toLowerCase())
        );
      });
    }
  },
  methods: {
    formatDate(iso) {
      return new Date(iso).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
    },
    async fetchReservations() {
      this.loading = true;
      try {
        const token = this.$store.state.token;
        const { data } = await this.$axios.get(
          'https://airline-management-backend-bus7.onrender.com/api/reservations',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.reservations = data.filter(r => r.status === 'confirmed');
        for (const res of this.reservations) {
          await this.fetchBaggage(res._id);
        }
      } catch (err) {
        this.error = 'Error al cargar reservaciones';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    async fetchBaggage(reservationId) {
      try {
        const token = this.$store.state.token;
        const { data } = await this.$axios.get(
          `https://airline-management-backend-bus7.onrender.com/api/baggage?reservation=${reservationId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        let baggageData = null;
        if (Array.isArray(data) && data.length > 0) {
          baggageData = data[0];
        } else if (data && data.baggage) {
          baggageData = data.baggage;
        } else if (data && data.reservation) {
          baggageData = data;
        }
        if (baggageData) {
          this.baggageMap[reservationId] = baggageData;
        }
      } catch (err) {
        console.warn(`No se encontró equipaje para la reservación ${reservationId}`, err.response?.data || err);
      }
    },
    openCheckinForm(reservationId) {
      this.activeCheckin = reservationId;
      this.checkinForm = { weight: 0, method: '' };
      this.error = '';
    },
    cancelCheckin() {
      this.activeCheckin = null;
      this.error = '';
    },
    async submitCheckin(reservationId) {
      if (!this.checkinForm.weight) {
        this.error = 'El peso es obligatorio';
        return;
      }
      const hasExtraCharge = this.checkinForm.weight > 20;
      if (hasExtraCharge && !this.checkinForm.method) {
        this.error = 'Debes seleccionar un método de pago por exceso de equipaje';
        return;
      }
      if (!hasExtraCharge) {
        this.checkinForm.method = 'cash';
      }
      this.error = '';
      try {
        const token = this.$store.state.token;
        const payload = {
          reservation: reservationId,
          weight: this.checkinForm.weight,
          method: this.checkinForm.method
        };
        const { data } = await this.$axios.post(
          'https://airline-management-backend-bus7.onrender.com/api/baggage',
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const baggageData = data.baggage || data;
        this.baggageMap[reservationId] = baggageData;
        this.activeCheckin = null;
      } catch (err) {
        console.error('Error al hacer check-in:', err);
        this.error = err.response?.data?.message || 'Error al hacer check-in';
      }
    },
    limpiarFiltros() {
  this.filtroVuelo = '';
  this.filtroOrigen = '';
  this.filtroDestino = '';
  this.filtroFecha = '';
  this.filtroEstado = '';
  this.filtroBoardingPass = '';
}

  },
  created() {
    this.fetchReservations();
  }
};
</script>


<style scoped>

h2 {
  font-size: 1.8rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

p {
  margin-bottom: 0.5rem;
}

.text-red-500 {
  color: #e74c3c;
}

.text-yellow-600 {
  color: #f39c12;
}

.text-gray-600 {
  color: #7f8c8d;
}

.border {
  border: 1px solid #ddd;
}

.rounded {
  border-radius: 8px;
}

.shadow {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.bg-gray-50 {
  background-color: #f9f9f9;
}

.bg-green-500 {
  background-color: #27ae60;
}

.bg-blue-600 {
  background-color: #2980b9;
}

.text-white {
  color: white;
}

button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  transition: background-color 0.3s ease;
  border: none;
  cursor: pointer;
}

button:hover {
  filter: brightness(1.1);
}

input[type="number"], select {
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 0.95rem;
}

label {
  font-weight: 600;
  color: #2c3e50;
}

.reservation-card {
  padding: 1.2rem;
  border: 1px solid #dcdcdc;
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.reservation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mt-4 {
  margin-top: 1rem;
}

.pt-4 {
  padding-top: 1rem;
}

.w-32 {
  width: 8rem;
}

.w-40 {
  width: 10rem;
}

.ml-2 {
  margin-left: 0.5rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

input[type="text"],
input[type="date"],
select {
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 0.95rem;
  background-color: #fff;
}

input::placeholder {
  color: #aaa;
}

button:hover {
  filter: brightness(1.05);
}

button.bg-red-500 {
  background-color: #e74c3c;
}

button.bg-red-500:hover {
  background-color: #c0392b;
}

.flex {
  display: flex;
}

.flex-wrap {
  flex-wrap: wrap;
}

.gap-4 {
  gap: 1rem;
}

.items-center {
  align-items: center;
}

.w-48 {
  width: 12rem;
}

.w-64 {
  width: 16rem;
}

.bg-gray-100 {
  background-color: #f0f0f0;
}

</style>

<template>
  <div class="p-6">
    <h1 class="text-3xl mb-6">Gestión de Vuelos (Admin)</h1>

    <!-- Formulario Crear / Editar -->
    <form @submit.prevent="onSubmit" class="border p-4 rounded mb-8 bg-white shadow-md">
      <h2 class="text-xl mb-4 font-semibold text-gray-700">{{ editId ? 'Editar' : 'Crear' }} Vuelo</h2>
      <input v-model="form.flightNumber" placeholder="Número de vuelo" class="input" required />
      <input v-model="form.origin" placeholder="Origen" class="input" required />
      <input v-model="form.destination" placeholder="Destino" class="input" required />
      <input v-model="form.departureTime" type="datetime-local" class="input" required />
      <input v-model="form.arrivalTime" type="datetime-local" class="input" required />
      <input v-model.number="form.price" type="number" placeholder="Precio del vuelo (USD)" class="input" required />

      <label for="aircraft" class="label">Aeronave</label>
      <select v-model="form.aircraft" class="input" required>
        <option disabled value="">Selecciona una aeronave</option>
        <option v-for="a in aircrafts" :key="a._id" :value="a._id">
          {{ a.model }} ({{ a.totalSeats }} asientos)
        </option>
      </select>

          <label class="label">Tripulación</label>
    <div class="crew-checkboxes">
      <label v-for="e in employees" :key="e._id" class="checkbox-item">
        <input
          type="checkbox"
          :value="e._id"
          v-model="form.crew"
        />
        {{ e.user.email }} ({{ e.role }})
      </label>
    </div>


      <div class="mt-4">
        <button type="submit" class="btn">{{ editId ? 'Actualizar' : 'Crear' }}</button>
        <button v-if="editId" @click.prevent="resetForm" class="btn-sm-danger">Cancelar</button>
      </div>
    </form>

    <!-- Lista de vuelos -->
    <div v-if="flights.length === 0">No hay vuelos registrados.</div>
    <div v-else class="grid gap-6 grid-cols-1 md:grid-cols-2">
      <div v-for="f in flights" :key="f._id" class="flight-card">
        <div class="flight-header">
          <div>
            <h3 class="flight-title">{{ f.flightNumber }}</h3>
            <span class="flight-status">{{ f.status }}</span>
          </div>
          <div class="flight-actions">
            <button @click="startEdit(f)" class="btn-sm">Editar</button>
            <button @click="deleteFlight(f._id)" class="btn-sm-danger">Eliminar</button>
          </div>
        </div>

        <div class="flight-body">
          <div class="flight-info">
            <p><strong>Ruta:</strong> {{ f.origin }} → {{ f.destination }}</p>
            <p><strong>Salida:</strong> {{ formatDate(f.departureTime) }}</p>
            <p><strong>Llegada:</strong> {{ formatDate(f.arrivalTime) }}</p>
            <p><strong>Precio:</strong> ${{ f.price }}</p>
            <p>
              <strong>Aeronave:</strong>
              {{ f.aircraft?.model || 'No asignada' }}
              ({{ f.aircraft?.totalSeats || '---' }} asientos)
            </p>
            <p><strong>Tripulación:</strong>
              <span
                v-for="m in f.crew"
                :key="m._id"
                class="badge"
              >
                {{ m.user.email }}
              </span>
            </p>

          </div>

          <div class="flight-status-select">
            <label><strong>Status:</strong></label>
            <select v-model="f.status" @change="updateStatus(f)" class="input-inline">
              <option>scheduled</option>
              <option>delayed</option>
              <option>cancelled</option>
              <option>departed</option>
              <option>arrived</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import axios from 'axios';

export default {
  name: 'AdminFlights',
  data() {
    return {
      flights: [],
      employees: [],
      aircrafts: [],
      form: {
        flightNumber: '',
        origin: '',
        destination: '',
        departureTime: '',
        arrivalTime: '',
        aircraft: '',
        price: null,
        crew: []
      },
      editId: null
    };
  },
  methods: {
    async fetchAll() {
      const token = localStorage.getItem('token');
      const [flR, empR, acR] = await Promise.all([
        axios.get('https://airline-management-backend-bus7.onrender.com/api/flights', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('https://airline-management-backend-bus7.onrender.com/api/employees', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('https://airline-management-backend-bus7.onrender.com/api/aircrafts', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      this.flights = flR.data;
      this.employees = empR.data;
      this.aircrafts = acR.data;
    },
    formatDate(dt) {
      return new Date(dt).toLocaleString();
    },
    resetForm() {
      this.editId = null;
      Object.assign(this.form, {
        flightNumber: '',
        origin: '',
        destination: '',
        departureTime: '',
        arrivalTime: '',
        aircraft: '',
        price: null,
        crew: []
      });
    },
    async onSubmit() {
      const token = localStorage.getItem('token');
      const url = this.editId
        ? `https://airline-management-backend-bus7.onrender.com/api/flights/${this.editId}`
        : 'https://airline-management-backend-bus7.onrender.com/api/flights';
      const method = this.editId ? 'put' : 'post';
      await axios[method](url, this.form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.resetForm();
      this.fetchAll();
    },
    startEdit(f) {
      this.editId = f._id;
      Object.assign(this.form, {
        flightNumber: f.flightNumber,
        origin: f.origin,
        destination: f.destination,
        departureTime: f.departureTime.slice(0, 16),
        arrivalTime: f.arrivalTime.slice(0, 16),
        aircraft: f.aircraft?._id || '',
        price: f.price,
        crew: f.crew.map(e => e._id)
      });
      window.scrollTo(0, 0);
    },
    async deleteFlight(id) {
  if (!confirm('¿Eliminar este vuelo?')) return;
  const token = localStorage.getItem('token');
  try {
    await axios.delete(
      `https://airline-management-backend-bus7.onrender.com/api/flights/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    this.fetchAll();
  } catch (error) {
    const msg = error.response?.data?.message || error.message;
    alert('No se pudo borrar el vuelo:\n' + msg);
  }
}
,
    async updateStatus(flight) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`https://airline-management-backend-bus7.onrender.com/api/flights/${flight._id}`, {
          status: flight.status
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.fetchAll();
      } catch (error) {
        console.error('Error al actualizar status:', error.response?.data || error.message);
      }
    }
  },
  mounted() {
    this.fetchAll();
  }
};
</script>

<style scoped>
.badge {
  display: inline-block;
  background-color: #e0f2fe;
  color: #0369a1;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.85rem;
  margin: 2px 4px 2px 0;
}

.p-6 {
  padding: 2rem;
  background-color: #f7f9fb;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

h1 {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 0.95rem;
}

.input:focus {
  border-color: #2563eb;
  outline: none;
}

select.input {
  background-color: white;
}

.btn {
  background-color: #2563eb;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  margin-right: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn:hover {
  background-color: #1e40af;
}

.btn-secondary {
  background-color: #6b7280;
}

.btn-secondary:hover {
  background-color: #4b5563;
}

.space-y-4 > * + * {
  margin-top: 1.5rem;
}

.flight-card {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.flight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.flight-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #1f2937;
}

.flight-status {
  font-size: 0.9rem;
  background-color: #e0f2fe;
  color: #0284c7;
  padding: 4px 10px;
  border-radius: 8px;
  margin-top: 4px;
  display: inline-block;
}

.flight-body {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.flight-info {
  flex: 2;
  font-size: 0.95rem;
  color: #374151;
  line-height: 1.5;
}

.flight-status-select {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.btn-sm {
  background-color: #3b82f6;
  color: white;
  padding: 6px 10px;
  font-size: 0.85rem;
  border-radius: 4px;
}

.btn-sm:hover {
  background-color: #2563eb;
}

.btn-sm-danger {
  background-color: #dc2626;
  color: white;
  padding: 6px 10px;
  font-size: 0.85rem;
  border-radius: 4px;
}

.btn-sm-danger:hover {
  background-color: #b91c1c;
}

.input-inline {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: white;
}
.crew-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 1rem;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #f9fafb;
  border: 1px solid #d1d5db;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.9rem;
}

</style>

<template>
  <div class="equipaje-container">
    <h2 class="titulo"><i class="fas fa-suitcase-rolling"></i> Gestión de Equipaje</h2>

    <!-- Filtros -->
    <div class="filtros">
      <div class="campo">
        <i class="fas fa-envelope"></i>
        <input v-model="filters.email" type="text" placeholder="Buscar por email" />
      </div>
      <div class="campo">
        <i class="fas fa-id-card"></i>
        <input v-model="filters.reservationId" type="text" placeholder="ID de reservación" />
      </div>
      <div class="campo">
        <i class="fas fa-ticket-alt"></i>
        <input v-model="filters.boardingPass" type="text" placeholder="Boarding pass" />
      </div>
      <button @click="fetchBaggage" class="btn-buscar">
        <i class="fas fa-search"></i> Buscar
      </button>
    </div>

    <!-- Tabla -->
    <div class="tabla-wrapper">
  <table class="tabla-equipaje">
    <thead>
      <tr>
        <th><i class="fas fa-ticket-alt"></i> Boarding Pass</th>
        <th><i class="fas fa-weight-hanging"></i> Peso</th>
        <th><i class="fas fa-dollar-sign"></i> Cargo extra</th>
        <th><i class="fas fa-info-circle"></i> Estado</th>
        <th><i class="fas fa-user"></i> Cliente</th>
        <th><i class="fas fa-id-card-alt"></i> Reservación</th>
        <th><i class="fas fa-cogs"></i> Acciones</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="b in baggages" :key="b._id">
        <td>{{ b.boardingPass }}</td>
        <td>{{ b.weight }} kg</td>
        <td>${{ b.extraCharge }}</td>
        <td>{{ b.status }}</td>
        <td>{{ b.reservation?.customer?.user?.email }}</td>
        <td>{{ b.reservation?._id }}</td>
        <td>
          <select v-model="b.status">
            <option value="checked">Checked</option>
            <option value="loaded">Loaded</option>
            <option value="delivered">Delivered</option>
          </select>
          <button @click="updateStatus(b)" class="btn-actualizar">
            <i class="fas fa-sync-alt"></i>
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</div>


    <p v-if="error" class="error-msg"><i class="fas fa-exclamation-triangle"></i> {{ error }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      baggages: [],
      filters: {
        email: '',
        reservationId: '',
        boardingPass: ''
      },
      error: ''
    };
  },
  methods: {
    async fetchBaggage() {
      try {
        this.error = '';
        const token = this.$store.state.token;
        const queryParams = new URLSearchParams();
        if (this.filters.email) queryParams.append('email', this.filters.email);
        if (this.filters.reservationId) queryParams.append('reservation', this.filters.reservationId);
        if (this.filters.boardingPass) queryParams.append('boardingPass', this.filters.boardingPass);

        const { data } = await this.$axios.get(
          `https://airline-management-backend-bus7.onrender.com/api/baggage/all?${queryParams.toString()}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.baggages = data;
      } catch (err) {
        console.error(err);
        this.error = err.response?.data?.message || 'Error al cargar equipaje';
      }
    },
    async updateStatus(baggage) {
      try {
        this.error = '';
        const token = this.$store.state.token;
        await this.$axios.put(
          `https://airline-management-backend-bus7.onrender.com/api/baggage/${baggage._id}/status`,
          { status: baggage.status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await this.fetchBaggage();
        alert('Estado actualizado correctamente');
      } catch (err) {
        console.error(err);
        this.error = err.response?.data?.message || 'Error al actualizar estado del equipaje';
      }
    }
  },
  mounted() {
    this.fetchBaggage();
  }
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

.equipaje-container {
  padding: 2rem;
  background: #fefefe;
  border-radius: 10px;
  font-family: 'Segoe UI', sans-serif;
}

.titulo {
  font-size: 1.6rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
}

.campo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f1f1f1;
  padding: 0.5rem 0.8rem;
  border-radius: 6px;
}

.campo input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.95rem;
}

.btn-buscar {
  background-color: #3498db;
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-buscar:hover {
  background-color: #2980b9;
}

.tabla-wrapper {
  overflow-x: auto;
}

.tabla-equipaje {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
  background-color: #fff;
  border: 1px solid #ddd;
}

.tabla-equipaje th,
.tabla-equipaje td {
  padding: 0.75rem;
  text-align: left;
  border: 1px solid #ddd;
  font-size: 0.95rem;
}

.tabla-equipaje th {
  background-color: #ecf0f1;
  font-weight: 600;
  color: #2c3e50;
}

.tabla-equipaje tr:hover {
  background-color: #f9f9f9;
}

select {
  padding: 0.3rem 0.6rem;
  font-size: 0.9rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.btn-actualizar {
  margin-left: 0.5rem;
  background-color: #2ecc71;
  color: white;
  padding: 0.3rem 0.6rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
}

.btn-actualizar:hover {
  background-color: #27ae60;
}

.error-msg {
  color: #e74c3c;
  font-weight: 500;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>

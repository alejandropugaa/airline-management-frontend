<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Nómina por intervalo</h2>

    <div class="mb-4 grid grid-cols-2 gap-4">
      <div>
        <label class="block mb-1">Fecha de inicio:</label>
        <input type="date" v-model="start" class="p-2 border rounded w-full" />
      </div>
      <div>
        <label class="block mb-1">Fecha de fin:</label>
        <input type="date" v-model="end" class="p-2 border rounded w-full" />
      </div>
    </div>

    <button @click="fetchPayroll" class="bg-blue-600 text-white px-4 py-2 rounded">
      Consultar Nómina
    </button>

    <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>

    <table v-if="payroll.length" class="w-full mt-6 border-collapse border">
      <thead>
        <tr class="bg-gray-200">
          <th class="border px-4 py-2">Empleado</th>
          <th class="border px-4 py-2">Rol</th>
          <th class="border px-4 py-2">Horas</th>
          <th class="border px-4 py-2">Pago por hora</th>
          <th class="border px-4 py-2">Pago total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="entry in payroll" :key="entry.employee">
          <td class="border px-4 py-2">{{ entry.employee }}</td>
          <td class="border px-4 py-2">{{ entry.role }}</td>
          <td class="border px-4 py-2">{{ entry.hours }}</td>
          <td class="border px-4 py-2">${{ entry.rate }}</td>
          <td class="border px-4 py-2 font-semibold">${{ entry.totalPay }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'AdminPayrollAllView',
  data() {
    return {
      start: '',
      end: '',
      payroll: [],
      error: ''
    };
  },
  methods: {
    async fetchPayroll() {
  console.log('fetchPayroll llamado');
  if (!this.start || !this.end) {
    this.error = 'Debes seleccionar ambas fechas';
    console.log('Fechas no completas:', this.start, this.end);
    return;
  }

  this.error = '';
  try {
    console.log('Haciendo petición para fechas:', this.start, this.end);
    const token = this.$store.state.token;
    console.log('Token:', token);
    const { data } = await this.$axios.get(
      `https://airline-management-backend-bus7.onrender.com/api/employee/payroll?start=${this.start}&end=${this.end}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('Datos recibidos:', data);
    this.payroll = data;
  } catch (err) {
    console.error('Error en fetchPayroll:', err);
    this.error = err.response?.data?.message || 'Error al consultar la nómina';
  }
}

  }
};
</script>
<style scoped>
.p-4 {
  padding: 2rem;
  font-family: Arial, sans-serif;
  background-color: #f8f9fa;
  min-height: 100vh;
}

h2 {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: #333;
}

/* Contenedor de fechas */
.grid {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

label {
  font-weight: 600;
  color: #444;
  margin-bottom: 0.5rem;
  display: block;
}

input[type="date"] {
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  width: 100%;
  font-size: 0.95rem;
}

button {
  background-color: #007bff;
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

button:hover {
  background-color: #0069d9;
  transform: translateY(-1px);
}

.text-red-500 {
  color: #d9534f;
  margin-top: 1rem;
  font-weight: bold;
}

/* Tabla */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 2rem;
  background-color: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
}

th, td {
  padding: 1rem;
  border: 1px solid #e2e8f0;
  text-align: left;
  font-size: 0.95rem;
}

thead {
  background-color: #f1f5f9;
  color: #333;
  text-transform: uppercase;
}

tbody tr:hover {
  background-color: #f9f9f9;
}

.font-semibold {
  font-weight: bold;
}

</style>
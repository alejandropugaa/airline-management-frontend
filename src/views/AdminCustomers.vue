<template>
  <div class="p-6">
    <h1 class="text-3xl mb-6">Lista de Clientes (Admin)</h1>

    <!-- Formulario creación/edición -->
    <div class="mb-6 p-4 border rounded bg-gray-50">
      <h2 class="text-xl mb-4">{{ isEditing ? 'Editar Cliente' : 'Nuevo Cliente' }}</h2>
      <form @submit.prevent="isEditing ? updateCustomer() : createCustomer()">

        <div class="mb-2">
      <label class="block mb-1">Usuario:</label>
      <select v-model="form.user" :disabled="isEditing" class="border p-2 w-full">
        <option disabled value="">Seleccione un usuario</option>
        <option v-for="u in availableUsers" :key="u._id" :value="u._id">
          {{ u.email }}
        </option>
      </select>
    </div>


        <div class="mb-2">
          <label class="block mb-1">Pasaporte:</label>
          <input v-model="form.passport" class="border p-2 w-full" />
        </div>
        <div class="mb-2">
          <label class="block mb-1">Teléfono:</label>
          <input v-model="form.contactInfo.phone" class="border p-2 w-full" />
        </div>
        <div class="mb-2">
          <label class="block mb-1">Dirección:</label>
          <input v-model="form.contactInfo.address" class="border p-2 w-full" />
        </div>
        <div class="mb-2">
          <label class="block mb-1">Frequent Flyer Status:</label>
          <input v-model="form.frequentFlyer.status" class="border p-2 w-full" />
        </div>
        <div class="mb-2">
          <label class="block mb-1">Puntos Frequent Flyer:</label>
          <input type="number" v-model.number="form.frequentFlyer.points" class="border p-2 w-full" />
        </div>
        <div class="mb-2">
          <label class="block mb-1">Preferencia de asiento:</label>
          <input v-model="form.preferences.seatPreference" class="border p-2 w-full" />
        </div>
        <div class="mb-2">
          <label class="block mb-1">Preferencia de comida:</label>
          <input v-model="form.preferences.mealPreference" class="border p-2 w-full" />
        </div>

        <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">
          {{ isEditing ? 'Actualizar' : 'Crear' }}
        </button>
        <button v-if="isEditing" @click="cancelEdit" type="button" class="ml-2 bg-gray-500 text-white px-4 py-2 rounded">
          Cancelar
        </button>
      </form>
    </div>

    <!-- Tabla de clientes -->
    <table class="min-w-full border-collapse border border-gray-300">
      <thead>
        <tr>
          <th class="border border-gray-300 px-4 py-2">Email</th>
          <th class="border border-gray-300 px-4 py-2">Pasaporte</th>
          <th class="border border-gray-300 px-4 py-2">Teléfono</th>
          <th class="border border-gray-300 px-4 py-2">Dirección</th>
          <th class="border border-gray-300 px-4 py-2">Frequent Flyer</th>
          <th class="border border-gray-300 px-4 py-2">Puntos</th>
          <th class="border border-gray-300 px-4 py-2">Preferencias</th>
          <th class="border border-gray-300 px-4 py-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in customers" :key="c._id">
          <td class="border border-gray-300 px-4 py-2">{{ c.user?.email || 'N/A' }}</td>
          <td class="border border-gray-300 px-4 py-2">{{ c.passport }}</td>
          <td class="border border-gray-300 px-4 py-2">{{ c.contactInfo.phone }}</td>
          <td class="border border-gray-300 px-4 py-2">{{ c.contactInfo.address }}</td>
          <td class="border border-gray-300 px-4 py-2">{{ c.frequentFlyer.status }}</td>
          <td class="border border-gray-300 px-4 py-2">{{ c.frequentFlyer.points }}</td>
          <td class="border border-gray-300 px-4 py-2">
            Asiento: {{ c.preferences.seatPreference || '-' }} <br />
            Comida: {{ c.preferences.mealPreference || '-' }}
          </td>
          <td class="border border-gray-300 px-4 py-2">
            <button @click="startEdit(c)" class="bg-yellow-400 text-white px-2 py-1 rounded mr-2">Editar</button>
            <button @click="deleteCustomer(c._id)" class="bg-red-500 text-white px-2 py-1 rounded">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AdminCustomers',
  data() {
    return {
      customers: [],
      availableUsers: [], // para el select
      form: {
        _id: null,
        user: '',
        passport: '',
        contactInfo: {
          phone: '',
          address: ''
        },
        frequentFlyer: {
          status: '',
          points: 0
        },
        preferences: {
          seatPreference: '',
          mealPreference: ''
        }
      },
      isEditing: false
    };
  },
  methods: {
    async fetchCustomers() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('https://airline-management-backend-bus7.onrender.com/api/customers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.customers = res.data;
      } catch (error) {
        console.error('Error cargando clientes:', error);
      }
    },

    async fetchAvailableUsers() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('https://airline-management-backend-bus7.onrender.com/api/users/customers/available-users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.availableUsers = res.data;
      } catch (error) {
        console.error('Error cargando usuarios disponibles:', error);
      }
    },

    resetForm() {
      this.form = {
        _id: null,
        user: '',
        passport: '',
        contactInfo: { phone: '', address: '' },
        frequentFlyer: { status: '', points: 0 },
        preferences: { seatPreference: '', mealPreference: '' }
      };
    },

    async createCustomer() {
      try {
        const token = localStorage.getItem('token');
        await axios.post('https://airline-management-backend-bus7.onrender.com/api/customers/admin', this.form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.resetForm();
        await this.fetchCustomers();
        await this.fetchAvailableUsers(); // refrescar usuarios disponibles
      } catch (error) {
        alert(error.response?.data?.message || 'Error al crear cliente');
      }
    },

    startEdit(customer) {
      this.isEditing = true;
      this.form = JSON.parse(JSON.stringify(customer)); // deep copy
      if (!this.form.contactInfo) this.form.contactInfo = { phone: '', address: '' };
      if (!this.form.frequentFlyer) this.form.frequentFlyer = { status: '', points: 0 };
      if (!this.form.preferences) this.form.preferences = { seatPreference: '', mealPreference: '' };
    },

    cancelEdit() {
      this.isEditing = false;
      this.resetForm();
    },

    async updateCustomer() {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`https://airline-management-backend-bus7.onrender.com/api/customers/${this.form._id}`, this.form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.isEditing = false;
        this.resetForm();
        await this.fetchCustomers();
        await this.fetchAvailableUsers(); // refrescar usuarios disponibles
      } catch (error) {
        alert(error.response?.data?.message || 'Error al actualizar cliente');
      }
    },

    async deleteCustomer(id) {
      if (!confirm('¿Seguro que quieres eliminar este cliente?')) return;
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`https://airline-management-backend-bus7.onrender.com/api/customers/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        await this.fetchCustomers();
        await this.fetchAvailableUsers(); // refrescar usuarios disponibles
      } catch (error) {
        alert(error.response?.data?.message || 'Error al eliminar cliente');
      }
    }
  },
  mounted() {
    this.fetchCustomers();
    this.fetchAvailableUsers();
  }
};
</script>

<style scoped>
table {
  border-collapse: collapse;
  width: 100%;
}

th, td {
  text-align: left;
  padding: 0.5rem;
}

th {
  background-color: #f3f4f6;
}
/* Contenedor general */
.p-6 {
  padding: 2rem;
  background-color: #f9fafb;
  min-height: 100vh;
  font-family: Arial, sans-serif;
}

/* Títulos */
h1 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: #333;
}

h2 {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #444;
}

/* Formulario */
form {
  background: #fff;
  padding: 1.5rem;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.mb-2 {
  margin-bottom: 1rem;
}

label {
  font-weight: 600;
  margin-bottom: 0.4rem;
  display: block;
  color: #333;
}

input,
select {
  width: 100%;
  padding: 0.65rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.95rem;
  box-sizing: border-box;
}

/* Botones */
button {
  font-weight: bold;
  border: none;
  padding: 0.6rem 1rem;
  cursor: pointer;
  border-radius: 6px;
  transition: transform 0.2s ease, background-color 0.3s ease;
}

button:hover {
  transform: translateY(-1px);
}

.bg-blue-500 {
  background-color: #007bff;
  color: white;
}

.bg-blue-500:hover {
  background-color: #0069d9;
}

.bg-gray-500 {
  background-color: #6c757d;
  color: white;
}

.bg-gray-500:hover {
  background-color: #5a6268;
}

.bg-yellow-400 {
  background-color: #f0ad4e;
  color: white;
}

.bg-yellow-400:hover {
  background-color: #ec971f;
}

.bg-red-500 {
  background-color: #d9534f;
  color: white;
}

.bg-red-500:hover {
  background-color: #c9302c;
}

/* Tabla */
table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ccc;
  margin-top: 2rem;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

th, td {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  vertical-align: top;
}

th {
  background-color: #f1f5f9;
  text-align: left;
  font-size: 0.9rem;
  color: #555;
}

tr:hover {
  background-color: #f9f9f9;
}

td button {
  margin-right: 0.5rem;
}

</style>

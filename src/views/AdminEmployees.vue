<template>
  <div class="container">
    <h1 class="title">Gestión de Empleados</h1>

    <!-- Formulario -->
    <form @submit.prevent="isEditing ? updateEmployee() : createEmployee()" class="form-card">
      <div class="form-group">
        <label class="form-label">Usuario</label>
        <select v-model="form.user" :disabled="isEditing" class="form-input">
          <option v-for="u in availableUsers" :key="u._id" :value="u._id">{{ u.email }}</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Rol del empleado</label>
        <select v-model="form.role" class="form-input">
          <option value="pilot">Piloto</option>
          <option value="crew">Tripulante</option>
          <option value="ground">Personal de Tierra</option>
        </select>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-blue">
          {{ isEditing ? 'Actualizar' : 'Agregar' }} Empleado
        </button>
        <button v-if="isEditing" @click.prevent="cancelEdit" class="btn-cancel">
          Cancelar
        </button>
      </div>
    </form>

    <!-- Tabla -->
    <div v-if="employees.length" class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Rol de Usuario</th>
            <th>Rol de Empleado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in employees" :key="e._id">
            <td>{{ e.user.email }}</td>
            <td>{{ e.user.role }}</td>
            <td>{{ mostrarRol(e.role) }}</td>
            <td class="actions">
              <button @click="startEdit(e)" class="btn btn-yellow">Editar</button>
              <button @click="deleteEmployee(e._id)" class="btn btn-red">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="no-data">No hay empleados registrados.</div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AdminEmployees',
  data() {
    return {
      employees: [],
      availableUsers: [],
      form: {
        _id: '',
        user: '',
        role: 'pilot'
      },
      isEditing: false
    };
  },
  methods: {
    async fetchEmployees() {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://airline-management-backend-bus7.onrender.com/api/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.employees = res.data;
    },
    async fetchAvailableUsers() {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://airline-management-backend-bus7.onrender.com/api/users/employees/available-users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.availableUsers = res.data;
    },
    async createEmployee() {
      const token = localStorage.getItem('token');
      try {
        await axios.post('https://airline-management-backend-bus7.onrender.com/api/employees', this.form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.form.user = '';
        this.form.role = 'pilot';
        await this.fetchEmployees();
        await this.fetchAvailableUsers();
      } catch (error) {
        if (error.response && error.response.status === 400) {
          alert(error.response.data.message);
        } else {
          alert('Ocurrió un error al crear el empleado.');
        }
        console.error(error);
      }
    },
    async updateEmployee() {
      const token = localStorage.getItem('token');
      await axios.put(`https://airline-management-backend-bus7.onrender.com/api/employees/${this.form._id}`, {
        role: this.form.role
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.cancelEdit();
      await this.fetchEmployees();
    },
    async deleteEmployee(id) {
      const token = localStorage.getItem('token');
      await axios.delete(`https://airline-management-backend-bus7.onrender.com/api/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await this.fetchEmployees();
      await this.fetchAvailableUsers();
    },
    startEdit(employee) {
      this.form = { _id: employee._id, user: employee.user._id, role: employee.role };
      this.isEditing = true;
    },
    cancelEdit() {
      this.isEditing = false;
      this.form = { _id: '', user: '', role: 'pilot' };
    },
    mostrarRol(codigo) {
      switch (codigo) {
        case 'pilot': return 'Piloto';
        case 'crew': return 'Tripulante';
        case 'ground': return 'Personal de Tierra';
        default: return codigo;
      }
    }
  },
  mounted() {
    this.fetchEmployees();
    this.fetchAvailableUsers();
  }
};
</script>

<style scoped>
.container {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
  font-family: Arial, sans-serif;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 2rem;
  border-bottom: 2px solid #ccc;
  padding-bottom: 0.5rem;
}

.form-card {
  background: #fff;
  border: 1px solid #ddd;
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  max-width: 700px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 600;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 0.95rem;
}

.form-input:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn-blue {
  background-color: #007bff;
  color: white;
}

.btn-yellow {
  background-color: #f0ad4e;
  color: white;
}

.btn-red {
  background-color: #d9534f;
  color: white;
}

.btn-cancel {
  color: #c00;
  background: none;
  border: none;
  font-weight: bold;
  cursor: pointer;
  padding: 0;
}

.btn-cancel:hover {
  text-decoration: underline;
}

.table-wrapper {
  overflow-x: auto;
  border: 1px solid #ccc;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead {
  background-color: #f1f5f9;
  color: #444;
  text-transform: uppercase;
}

.table th, .table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.table tr:hover {
  background-color: #f9f9f9;
}

.actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.no-data {
  margin-top: 2rem;
  text-align: center;
  color: #777;
  font-size: 1.1rem;
}
</style>

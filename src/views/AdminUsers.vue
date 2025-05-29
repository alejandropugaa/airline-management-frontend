<template>
  <div class="container">
    <h1 class="title">Usuarios Registrados</h1>

    <!-- Crear nuevo usuario -->
    <div class="form-card">
      <h2 class="form-title">Crear Nuevo Usuario</h2>
      <form @submit.prevent="createUser" class="form-grid">
        <input v-model="newUser.email" type="email" placeholder="Email" class="form-input" required />
        <input v-model="newUser.password" type="password" placeholder="Contraseña" class="form-input" required />
        <select v-model="newUser.role" class="form-input" required>
          <option disabled value="">Selecciona rol</option>
          <option value="admin">Admin</option>
          <option value="employee">Employee</option>
          <option value="customer">Customer</option>
        </select>
        <button type="submit" class="btn btn-blue">Crear</button>
      </form>
    </div>

    <!-- Tabla de usuarios -->
    <div v-if="users.length === 0" class="no-users">No hay usuarios registrados.</div>
    <div v-else class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Rol</th>
            <th>Fecha de Registro</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u._id">
            <td><input v-model="u.email" class="form-input small" /></td>
            <td>
              <select v-model="u.role" class="form-input small">
                <option value="admin">Admin</option>
                <option value="employee">Employee</option>
                <option value="customer">Customer</option>
              </select>
            </td>
            <td>{{ formatDate(u.createdAt) }}</td>
            <td class="actions">
              <button @click="updateUser(u)" class="btn btn-yellow">Actualizar</button>
              <button @click="deleteUser(u._id)" class="btn btn-red">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AdminUsers',
  data() {
    return {
      users: [],
      newUser: {
        email: '',
        password: '',
        role: ''
      }
    };
  },
  methods: {
    async fetchUsers() {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://airline-management-backend-bus7.onrender.com/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.users = res.data;
    },
    async createUser() {
      try {
        const token = localStorage.getItem('token');
        await axios.post('https://airline-management-backend-bus7.onrender.com/api/users', this.newUser, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.newUser = { email: '', password: '', role: '' };
        this.fetchUsers();
      } catch (error) {
        alert('Error al crear usuario');
      }
    },
    async updateUser(user) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`https://airline-management-backend-bus7.onrender.com/api/users/${user._id}`, {
          email: user.email,
          role: user.role
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Usuario actualizado');
      } catch (error) {
        alert('Error al actualizar usuario');
      }
    },
    async deleteUser(id) {
      if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`https://airline-management-backend-bus7.onrender.com/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.fetchUsers();
      } catch (error) {
        alert('Error al eliminar usuario');
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleString();
    }
  },
  mounted() {
    this.fetchUsers();
  }
};
</script>

<style scoped>
.container {
  padding: 2rem;
  min-height: 100vh;
  font-family: Arial, sans-serif;
  background: linear-gradient(to bottom right, #f4f4f4, #fff);
}

.title {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 2rem;
  font-weight: bold;
}

.form-card {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  max-width: 1000px;
}

.form-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #444;
}

.form-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  flex: 1 1 200px;
  min-width: 200px;
}

.form-input.small {
  padding: 0.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
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

.btn-blue:hover {
  background-color: #0069d9;
}

.btn-yellow {
  background-color: #f0ad4e;
  color: white;
}

.btn-yellow:hover {
  background-color: #ec971f;
}

.btn-red {
  background-color: #d9534f;
  color: white;
}

.btn-red:hover {
  background-color: #c9302c;
}

.no-users {
  color: #888;
  text-align: center;
  margin-top: 2rem;
  font-size: 1.1rem;
}

.table-wrapper {
  overflow-x: auto;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.table thead {
  background-color: #e9f1ff;
  color: #333;
  text-transform: uppercase;
}

.table th,
.table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.table tr:hover {
  background-color: #f9f9f9;
}

.actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}
</style>

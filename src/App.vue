<template>
  <div>
    <!-- Barra de navegación -->
    <nav class="navbar">
      <div class="nav-logo">
        <router-link to="/">Aerolínea</router-link>
      </div>
      <div class="nav-links">
        <!-- No autenticado -->
        <router-link v-if="!isAuthenticated" to="/login">Login</router-link>

        <!-- Cliente -->
        <template v-if="isAuthenticated && role === 'customer'">
          <router-link to="/vuelos">Vuelos</router-link>
          <router-link to="/reservations">Reservas</router-link>
          <router-link to="/baggage">Equipaje</router-link>
          <router-link to="/profile">Perfil</router-link>
          
        </template>

        <!-- Empleado -->
        <template v-if="isAuthenticated && role === 'employee'">
          <router-link to="/employee-schedule">Mi Horario</router-link>
          <router-link to="/ground/baggage">Modificar Equipaje</router-link>
        </template>

        <!-- Admin -->
        <template v-if="isAuthenticated && role === 'admin'">
          <router-link to="/admin/flights">Vuelos</router-link>
          <router-link to="/admin/users">Usuarios</router-link>
          <router-link to="/admin/employees">Empleados</router-link>
          <router-link to="/admin/customers">Clientes</router-link>
          <router-link to="/admin/payroll">Nómina</router-link>
          <router-link to="/admin/dashboard">Dashboard</router-link>
        </template>

        <!-- Logout -->
        <a v-if="isAuthenticated" href="#" @click.prevent="logout" class="logout">Logout</a>
      </div>
    </nav>

    <!-- Contenido dinámico -->
    <router-view />
  </div>
</template>

<script>
export default {
  computed: {
    isAuthenticated() {
      return this.$store.getters.isAuthenticated;
    },
    role() {
      return this.$store.state.user?.role || '';
    }
  },
  methods: {
    logout() {
      this.$store.commit('setToken', null);
      this.$store.commit('setUser', null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
.navbar {
  background-color: #2c3e50;
  padding: 15px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.nav-logo a {
  color: #ffffff;
  font-size: 20px;
  font-weight: bold;
  text-decoration: none;
}

.nav-links {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
}

.nav-links a {
  color: #ecf0f1;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-links a.router-link-exact-active {
  color: #42b983;
  border-bottom: 2px solid #42b983;
}

.nav-links a:hover {
  color: #1abc9c;
}

.logout {
  background-color: transparent;
  border: none;
  color: #e74c3c;
  font-weight: bold;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}

@media (max-width: 768px) {
  .nav-links {
    flex-direction: column;
    align-items: flex-start;
    margin-top: 10px;
  }
}
</style>

<template>
  <div class="home">
    <div class="card">
      <h1>Bienvenido a la Aerolínea</h1>
      <p>Selecciona una opción en el menú para continuar.</p>

      <div v-if="user" class="usuario">
        <p><strong>Usuario:</strong> {{ user.email }}</p>
        <p><strong>Rol:</strong> {{ user.role }}</p>

        <div class="acciones">
          <router-link
            v-if="user.role === 'employee' || user.role === 'pilot'"
            to="/employee-schedule"
            class="boton"
          >Ver mi horario</router-link>

          <router-link
            v-if="user.role === 'customer'"
            to="/reservations"
            class="boton"
          >Ver mis reservaciones</router-link>

          <router-link
            v-if="user.role === 'customer'"
            to="/profile"
            class="boton"
          >Mi perfil</router-link>
        </div>
      </div>

      <div v-else>
        <p>Por favor inicia sesión para acceder a más funciones.</p>
        <router-link to="/login" class="boton boton-secundario">Ir a Login</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeVue',
  computed: {
    user() {
      return this.$store.state.user;
    }
  }
};
</script>

<style scoped>
.home {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
}

.card {
  background: white;
  padding: 30px 40px;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  text-align: center;
}

h1 {
  font-size: 24px;
  color: #2c3e50;
  margin-bottom: 16px;
}

p {
  margin: 8px 0;
  color: #555;
}

.acciones {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.boton {
  display: inline-block;
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.boton:hover {
  background-color: #2980b9;
}

.boton-secundario {
  background-color: #7f8c8d;
}

.boton-secundario:hover {
  background-color: #636e72;
}
</style>

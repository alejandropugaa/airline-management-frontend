<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Iniciar Sesión</h1>

      <form @submit.prevent="login">
        <div class="form-group">
          <label>Email:</label>
          <input v-model="email" type="email" required />
        </div>

        <div class="form-group">
          <label>Contraseña:</label>
          <input v-model="password" type="password" required />
        </div>

        <button type="submit" class="btn-login">Entrar</button>
      </form>

      <p v-if="error" class="error-msg">{{ error }}</p>

      <p class="registro">
        ¿No tienes una cuenta?
        <router-link to="/register">Regístrate aquí</router-link>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginView',
  data() {
    return {
      email: '',
      password: '',
      error: ''
    }
  },
  methods: {
    async login() {
      try {
        const response = await this.$axios.post('https://airline-management-backend-bus7.onrender.com/api/auth/login', {
          email: this.email,
          password: this.password
        });
        this.$store.commit('setToken', response.data.token);
        this.$store.commit('setUser', response.data.user);
        this.$router.push('/home');
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al iniciar sesión';
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f2f5f7;
  padding: 20px;
}

.login-card {
  background: white;
  padding: 40px 30px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
  text-align: center;
}

h1 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 18px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: #34495e;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccd1d9;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.form-group input:focus {
  border-color: #42b983;
}

.btn-login {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  font-size: 15px;
  transition: background-color 0.2s ease;
}

.btn-login:hover {
  background-color: #36996f;
}

.error-msg {
  margin-top: 15px;
  color: red;
  font-weight: bold;
}

.registro {
  margin-top: 25px;
  font-size: 14px;
  color: #555;
}
.registro a {
  color: #42b983;
  text-decoration: underline;
}
</style>

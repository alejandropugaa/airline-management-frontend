<template>
  <div class="register-container">
    <div class="register-card">
      <h1>Registro de Cliente</h1>

      <form @submit.prevent="register">
        <div class="form-group">
          <label>Email:</label>
          <input v-model="email" type="email" required />
        </div>

        <div class="form-group">
          <label>Contraseña:</label>
          <input v-model="password" type="password" required />
        </div>

        <div class="form-group">
          <label>Confirmar Contraseña:</label>
          <input v-model="confirmPassword" type="password" required />
        </div>

        <div class="form-group">
          <label>Pasaporte:</label>
          <input v-model="passport" type="text" required />
        </div>

        <div class="form-group" v-if="codigoEnviado">
          <label>Código de Verificación (enviado a tu email):</label>
          <input v-model="verificationCode" type="text" required />
        </div>

        <div class="form-buttons">
          <button
            v-if="!codigoEnviado"
            @click.prevent="solicitarCodigo"
            class="btn-register"
          >
            Enviar Código
          </button>

          <button
            v-if="codigoEnviado"
            type="submit"
            class="btn-register"
          >
            Confirmar Registro
          </button>
        </div>
      </form>

      <p v-if="success" class="success-msg">{{ success }}</p>
      <p v-if="error" class="error-msg">{{ error }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
      confirmPassword: '',
      passport: '',
      verificationCode: '',
      codigoEnviado: false,
      error: '',
      success: ''
    };
  },
  methods: {
    async solicitarCodigo() {
      if (!this.email || !this.password || !this.confirmPassword || !this.passport) {
        this.error = 'Completa todos los campos antes de solicitar el código.';
        return;
      }

      if (this.password !== this.confirmPassword) {
        this.error = 'Las contraseñas no coinciden.';
        return;
      }

      try {
        await this.$axios.post('https://airline-management-backend-bus7.onrender.com/api/auth/send-verification-code', {
          email: this.email
        });
        this.codigoEnviado = true;
        this.success = 'Código enviado a tu correo electrónico.';
        this.error = '';
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al enviar código.';
        this.success = '';
      }
    },

    async register() {
      if (!this.verificationCode) {
        this.error = 'Debes ingresar el código de verificación.';
        return;
      }

      try {
        const response = await this.$axios.post('https://airline-management-backend-bus7.onrender.com/api/auth/registercustomer', {
          email: this.email,
          password: this.password,
          passport: this.passport,
          code: this.verificationCode
        });

        this.$store.commit('setToken', response.data.token);
        this.$store.commit('setUser', response.data.user);
        this.$router.push('/');
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al registrarse';
      }
    }
  }
};
</script>

<style scoped>
.success-msg {
  margin-top: 15px;
  color: green;
  font-weight: bold;
}
.register-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f4f8;
  padding: 20px;
}

.register-card {
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

.btn-register {
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

.btn-register:hover {
  background-color: #36996f;
}

.error-msg {
  margin-top: 15px;
  color: red;
  font-weight: bold;
}
</style>

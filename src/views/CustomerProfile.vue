<template>
  <div class="profile-container">
    <h1><i class="fas fa-user-circle"></i> Perfil del Cliente</h1>

    <div v-if="profile" class="profile-card">
      <!-- Vista de solo lectura -->
      <div v-if="!modoEdicion">
        <div class="section">
          <h2><i class="fas fa-id-card"></i> Información Personal</h2>
          <p><strong><i class="fas fa-passport"></i> Pasaporte:</strong> {{ profile.passport }}</p>
          <p><strong><i class="fas fa-phone"></i> Teléfono:</strong> {{ profile.contactInfo.phone }}</p>
          <p><strong><i class="fas fa-home"></i> Dirección:</strong> {{ profile.contactInfo.address }}</p>
        </div>

        <div class="section">
          <h2><i class="fas fa-cogs"></i> Preferencias</h2>
          <p><strong><i class="fas fa-chair"></i> Asiento:</strong> {{ profile.preferences.seatPreference }}</p>
          <p><strong><i class="fas fa-utensils"></i> Comida:</strong> {{ profile.preferences.mealPreference }}</p>
        </div>

        <div class="section">
          <h2><i class="fas fa-plane"></i> Viajero Frecuente</h2>
          <p><strong><i class="fas fa-star"></i> Estado:</strong> {{ profile.frequentFlyer.status }}</p>
          <p><strong><i class="fas fa-coins"></i> Puntos:</strong> {{ profile.frequentFlyer.points }}</p>
        </div>

        <button @click="modoEdicion = true" class="btn-edit">
          <i class="fas fa-pen"></i> Actualizar Datos
        </button>
      </div>

      <!-- Formulario editable -->
      <form v-else @submit.prevent="actualizarPerfil">
        <div class="section">
          <h2><i class="fas fa-id-card"></i> Información Personal</h2>
          <p><strong><i class="fas fa-passport"></i> Pasaporte:</strong> {{ profile.passport }}</p>

          <label><i class="fas fa-phone"></i> Teléfono:</label>
          <input v-model="form.phone" type="text" />

          <label><i class="fas fa-home"></i> Dirección:</label>
          <input v-model="form.address" type="text" />
        </div>

        <div class="section">
          <h2><i class="fas fa-cogs"></i> Preferencias</h2>

          <label><i class="fas fa-chair"></i> Asiento:</label>
          <select v-model="form.seatPreference">
            <option value="any">Cualquiera</option>
            <option value="window">Ventana</option>
            <option value="aisle">Pasillo</option>
          </select>

          <label><i class="fas fa-utensils"></i> Comida:</label>
          <select v-model="form.mealPreference">
            <option value="standard">Estándar</option>
            <option value="vegetarian">Vegetariana</option>
            <option value="vegan">Vegana</option>
            <option value="kosher">Kosher</option>
          </select>
        </div>

        <div class="section">
          <h2><i class="fas fa-plane"></i> Viajero Frecuente</h2>
          <p><strong><i class="fas fa-star"></i> Estado:</strong> {{ profile.frequentFlyer.status }}</p>
          <p><strong><i class="fas fa-coins"></i> Puntos:</strong> {{ profile.frequentFlyer.points }}</p>
        </div>

        <button type="submit" class="btn-save">
          <i class="fas fa-save"></i> Guardar Cambios
        </button>
        <button @click.prevent="cancelarEdicion" class="btn-cancel">
          <i class="fas fa-times"></i> Cancelar
        </button>

        <p v-if="success" class="success-msg">{{ success }}</p>
        <p v-if="error" class="error-msg">{{ error }}</p>
      </form>
    </div>

    <div v-else class="loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando perfil...
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      profile: null,
      modoEdicion: false,
      form: {
        phone: '',
        address: '',
        seatPreference: '',
        mealPreference: ''
      },
      error: '',
      success: ''
    };
  },
  async created() {
    try {
      const token = localStorage.getItem('token');
      const response = await this.$axios.get('https://airline-management-backend-bus7.onrender.com/api/customers/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.profile = response.data;
      this.rellenarFormulario();
    } catch (err) {
      this.error = 'No se pudo cargar el perfil';
      console.error(err);
    }
  },
  methods: {
    rellenarFormulario() {
      this.form.phone = this.profile.contactInfo.phone;
      this.form.address = this.profile.contactInfo.address;
      this.form.seatPreference = this.profile.preferences.seatPreference;
      this.form.mealPreference = this.profile.preferences.mealPreference;
    },
    cancelarEdicion() {
      this.rellenarFormulario();
      this.modoEdicion = false;
      this.success = '';
      this.error = '';
    },
    async actualizarPerfil() {
      try {
        const token = localStorage.getItem('token');
        const payload = {
          phone: this.form.phone,
          address: this.form.address,
          seatPreference: this.form.seatPreference,
          mealPreference: this.form.mealPreference
        };

        await this.$axios.put('https://airline-management-backend-bus7.onrender.com/api/customers/profile', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.profile.contactInfo.phone = this.form.phone;
        this.profile.contactInfo.address = this.form.address;
        this.profile.preferences.seatPreference = this.form.seatPreference;
        this.profile.preferences.mealPreference = this.form.mealPreference;

        this.success = 'Perfil actualizado correctamente';
        this.error = '';
        this.modoEdicion = false;
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al actualizar el perfil';
        this.success = '';
      }
    }
  }
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

.profile-container {
  min-height: 100vh;
  background-color: #f0f4f8;
  font-family: Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 2rem;
  margin-top: -10px; /* 🔽 Sube un poco el contenido hacia el navbar */
}


h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin-top: 1rem; /* 🔽 antes era más amplio */
  margin-bottom: 1.5rem;
}


.profile-card {
  background-color: #ffffff;
  padding: 40px 30px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  max-width: 700px;
  width: 100%;
}

.section {
  margin-bottom: 2rem;
}

.section h2 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #007acc;
}

.section p {
  margin: 0.4rem 0;
  font-size: 1rem;
  color: #34495e;
}

label {
  display: block;
  margin-bottom: 0.3rem;
  font-weight: 600;
  color: #34495e;
}

input,
select {
  display: block;
  width: 100%;
  margin-bottom: 1rem;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
  background-color: #fafafa;
}

input:focus,
select:focus {
  outline: none;
  border-color: #42b983;
}

.btn-save,
.btn-edit,
.btn-cancel {
  background-color: #42b983;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  margin-right: 10px;
  transition: background-color 0.2s ease;
}

.btn-save:hover,
.btn-edit:hover {
  background-color: #36996f;
}

.btn-cancel {
  background-color: #bdc3c7;
}

.btn-cancel:hover {
  background-color: #95a5a6;
}

.success-msg {
  margin-top: 10px;
  color: #27ae60;
  font-weight: bold;
}

.error-msg {
  margin-top: 10px;
  color: #e74c3c;
  font-weight: bold;
}

.loading {
  text-align: center;
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-top: 3rem;
}


</style>

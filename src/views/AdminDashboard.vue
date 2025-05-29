<template>
  <div class="dashboard">
    <h1>Dashboard de la Aerolínea</h1>
    <div class="grid">
      <div class="card">
        <h3>Ventas por periodo</h3>
        <canvas id="ventasChart"></canvas>
      </div>
      <div class="card">
        <h3>Vuelos por estado</h3>
        <canvas id="vuelosEstadoChart"></canvas>
      </div>
      <div class="card">
        <h3>Total de vuelos</h3>
        <canvas id="totalVuelosChart"></canvas>
      </div>
      <div class="card">
        <h3>Destino más solicitado</h3>
        <canvas id="destinoPopularChart"></canvas>
      </div>
      <div class="card">
        <h3>Vuelos por aeronave</h3>
        <canvas id="vuelosPorAvionChart"></canvas>
      </div>
      <div class="card">
        <h3>Reservas confirmadas vs canceladas</h3>
        <canvas id="reservasEstadoChart"></canvas>
      </div>
      <div class="card">
        <h3>Promedio de peso de equipaje</h3>
        <canvas id="promedioEquipajeChart"></canvas>
      </div>
      <div class="card">
        <h3>Métodos de pago utilizados</h3>
        <canvas id="metodoPagoChart"></canvas>
      </div>
      <div class="card">
        <h3>Total de clientes registrados</h3>
        <canvas id="totalClientesChart"></canvas>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
  async mounted() {
    const [
      ventas, vuelosEstado, vuelosTotales, destino, vuelosPorAvion,
      reservasEstado, equipaje, metodosPago, totalClientes
    ] = await Promise.all([
      fetch('https://airline-management-backend-bus7.onrender.com/api/dashboard/ventas').then(r => r.json()),
      fetch('https://airline-management-backend-bus7.onrender.com/api/dashboard/vuelos-por-estado').then(r => r.json()),
      fetch('https://airline-management-backend-bus7.onrender.com/api/dashboard/vuelos-programados').then(r => r.json()),
      fetch('https://airline-management-backend-bus7.onrender.com/api/dashboard/destino-popular').then(r => r.json()),
      fetch('https://airline-management-backend-bus7.onrender.com/api/dashboard/vuelos-por-avion').then(r => r.json()),
      fetch('https://airline-management-backend-bus7.onrender.com/api/dashboard/reservas-por-estado').then(r => r.json()),
      fetch('https://airline-management-backend-bus7.onrender.com/api/dashboard/promedio-equipaje').then(r => r.json()),
      fetch('https://airline-management-backend-bus7.onrender.com/api/dashboard/metodos-pago').then(r => r.json()),
      fetch('https://airline-management-backend-bus7.onrender.com/api/dashboard/clientes').then(r => r.json()),
    ]);

    new Chart(document.getElementById('ventasChart'), {
      type: 'bar',
      data: {
        labels: ['Semanal', 'Mensual', 'Anual'],
        datasets: [{
          label: 'Ventas ($)',
          data: [ventas.semanal, ventas.mensual, ventas.anual],
          backgroundColor: '#4bc0c0'
        }]
      }
    });

    new Chart(document.getElementById('vuelosEstadoChart'), {
      type: 'pie',
      data: {
        labels: vuelosEstado.map(e => e._id),
        datasets: [{
          data: vuelosEstado.map(e => e.total),
          backgroundColor: ['#42a5f5', '#ef5350', '#ffca28', '#66bb6a', '#ab47bc']
        }]
      }
    });

    new Chart(document.getElementById('totalVuelosChart'), {
      type: 'bar',
      data: {
        labels: ['Programados'],
        datasets: [{ label: 'Total', data: [vuelosTotales.total] }]
      }
    });

    new Chart(document.getElementById('destinoPopularChart'), {
      type: 'doughnut',
      data: {
        labels: [destino._id],
        datasets: [{ data: [destino.total] }]
      }
    });

    new Chart(document.getElementById('vuelosPorAvionChart'), {
      type: 'pie',
      data: {
        labels: vuelosPorAvion.map(a => a._id),
        datasets: [{
          data: vuelosPorAvion.map(a => a.total),
          backgroundColor: ['#ffa726', '#66bb6a', '#26c6da', '#ab47bc']
        }]
      }
    });

    new Chart(document.getElementById('reservasEstadoChart'), {
      type: 'bar',
      data: {
        labels: reservasEstado.map(r => r._id),
        datasets: [{
          label: 'Cantidad',
          data: reservasEstado.map(r => r.total),
          backgroundColor: ['#4caf50', '#f44336']
        }]
      }
    });

    new Chart(document.getElementById('promedioEquipajeChart'), {
      type: 'bar',
      data: {
        labels: ['Promedio'],
        datasets: [{
          label: 'Kg',
          data: [equipaje.promedio],
          backgroundColor: '#607d8b'
        }]
      }
    });

    const totalMetodos = metodosPago.reduce((sum, m) => sum + m.total, 0);
    new Chart(document.getElementById('metodoPagoChart'), {
      type: 'pie',
      data: {
        labels: metodosPago.map(p => `${p._id} (${((p.total / totalMetodos) * 100).toFixed(1)}%)`),
        datasets: [{
          data: metodosPago.map(p => p.total),
          backgroundColor: ['#42a5f5', '#66bb6a', '#ffca28', '#ef5350']
        }]
      }
    });

    new Chart(document.getElementById('totalClientesChart'), {
      type: 'bar',
      data: {
        labels: ['Clientes'],
        datasets: [{
          label: 'Total',
          data: [totalClientes.total],
          backgroundColor: '#3f51b5'
        }]
      }
    });
  }
};
</script>

<style>
.dashboard {
  padding: 30px;
  font-family: sans-serif;
}
h1 {
  text-align: center;
  margin-bottom: 30px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}
.card {
  background: white;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
h3 {
  text-align: center;
  margin-bottom: 10px;
}
canvas {
  width: 100% !important;
  height: 250px !important;
}
</style>

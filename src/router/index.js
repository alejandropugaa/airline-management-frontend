import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'
import Home from '../views/HomeVue.vue'
import Login from '../views/AppLogin.vue'
import Reservations from '../views/AppReservations.vue'
import EmployeeSchedule from '../views/EmployeeSchedule.vue'
import CustomerProfile from '../views/CustomerProfile.vue'
import Register from '@/views/RegisterC.vue'
import Nomina from '@/views/AdminPayroll.vue'
import Baggage from '@/views/CustomerBaggage.vue'
import EmployeeBaggage from '@/views/GroundBaggage.vue';
import Dashboard from '@/views/AdminDashboard.vue';


const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/home', component: Home },
  { path: '/reservations', component: Reservations, meta: { requiresAuth: true, role: 'customer' } },
  { path: '/employee-schedule', component: EmployeeSchedule, meta: { requiresAuth: true, role: 'employee' } },
  { path: '/profile', component: CustomerProfile, meta: { requiresAuth: true, role: 'customer' } },
  { path: '/vuelos', name: 'Flights', component: () => import('@/views/CustomerFlights.vue'), meta: { requiresAuth: true, role: 'customer' }},
  { path: '/admin/flights', component: () => import('@/views/AdminFlights.vue'), meta: { requiresAuth: true, roles: ['admin'] }},
  { path: '/admin/users', component: () => import('@/views/AdminUsers.vue'), meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/admin/employees', component: () => import('@/views/AdminEmployees.vue'), meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/admin/customers', component: () => import('@/views/AdminCustomers.vue'), meta: { requiresAuth: true, roles: ['admin'] } }, 
  { path: '/admin/payroll', component: Nomina, meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/baggage', component: Baggage, meta: { requiresAuth: true, role: 'customer' } },
  { path: '/ground/baggage', component: EmployeeBaggage, meta: { requiresAuth: true, role: 'employee' } },
  { path: '/admin/dashboard', component: Dashboard }
]



const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth
  const roleRequired = to.meta.role
  const isAuthenticated = store.getters.isAuthenticated
  const userRole = store.getters.userRole

  if (requiresAuth && !isAuthenticated) {
    return next('/login')
  }

  if (roleRequired && userRole !== roleRequired) {
    return next('/') // acceso denegado
  }

  next()
})

export default router

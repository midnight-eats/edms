<template>
  <v-sheet class="mx-auto pa-6 ma-6 align-baseline" width="800">
    <v-form ref="form" @submit.prevent="login">
      <v-text-field
        v-model="username"
        label="Логин"
        required
      ></v-text-field>
      <v-text-field
        v-model="password"
        label="Пароль"
        type="password"
        required
        md="12"
        cols="12"
      ></v-text-field>
      <v-btn type="submit" color="primary">Войти</v-btn>
      <div v-if="error" class="error-message">{{ error }}</div>
    </v-form>
  </v-sheet>
</template>

<script>
import axios from 'axios';

export default {
  data: () => ({
    username: '',
    password: '',
    error: null,
  }),
  mounted() { 
    this.emitter.emit("loggedout");   
  },
  methods: {
    async login() {
      this.error = null;
                
      try {
        const response = await axios.post('/api/login', {
          username: this.username,
          password: this.password,
        });

        console.log(response.data);     

        if (response.data.response == true) {
          localStorage.setItem('userToken', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          this.$router.push('/');
          this.emitter.emit("loggedin");   
               
        } else {
          this.error = "Доступ запрещен"    
        }


        // Store the token and user info (e.g., in localStorage or Vuex)
        
        // Redirect to a protected page
      } 
      catch (err) 
      {
        //this.error = 'Login failed. Check credentials.';
      }
    },
  },
};
</script>

<style scoped>
.error-message {
  color: red;
  margin-top: 10px;
}
</style>

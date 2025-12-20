<template>
  <v-form ref="form" @submit.prevent="login" max-width="500">
    <v-text-field
      v-model="username"
      label="Username"
      required
    ></v-text-field>
    <v-text-field
      v-model="password"
      label="Password"
      type="password"
      required
      md="12"
      cols="12"
    ></v-text-field>
    <v-btn type="submit" color="primary">Login</v-btn>
    <div v-if="error" class="error-message">{{ error }}</div>
  </v-form>
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

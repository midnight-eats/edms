<template>
  <v-row>
    <v-btn  @click="downloadDataFileJson">Сачать файл с данными (json)</v-btn>
    <!--v-btn  @click="downloadDataFileCsv">Сачать файл с данными (csv)</v-btn-->
  </v-row>
</template>

<script>
import axios from 'axios';

export default {
  methods: {
    async downloadDataFileJson() {
      try {
        const response = await axios.get('/api/download/datadump/json', {
          responseType: 'blob', // Important: tells axios to handle the response as binary data
          // Include headers if necessary, e.g.,
          // headers: {
          //   'Authorization': 'Bearer YOUR_JWT_TOKEN'
          // }
        });

        // Create a URL for the blob data
        const blob = new Blob([response.data], { type: response.headers['content-type'] });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        // Extract filename from the Content-Disposition header if needed, otherwise hardcode
      
        const now = new Date();

        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');

        const filename = `data-${year}-${month}-${day}-${hours}-${minutes}-${seconds}.json`;
            
        link.download = filename; 
        link.click(); // Programmatically click the link to trigger download

        // Clean up the blob URL
        URL.revokeObjectURL(link.href);
      } catch (error) {
        console.error('Download error:', error);
      }
    },

    async downloadDataFileCsv() {
      try {
        const response = await axios.get('/api/download/datadump/csv', {
          responseType: 'blob',
        });
        
        const blob = new Blob([response.data], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = response.headers['content-disposition']?.split('filename=')[1]?.replace(/"/g, '') || 'data.csv';
        link.click();
        
        URL.revokeObjectURL(link.href);
      } catch (error) {
        console.error('Download error:', error);
      }
    }
  }
}
</script>


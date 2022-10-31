import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

import { Quasar, Notify } from 'quasar'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'

// Import Quasar css
import 'quasar/src/css/index.sass'

let app = createApp(App)
    .use(Quasar, {
        plugins: {
            Notify
        },
    });
app.mount("#app");

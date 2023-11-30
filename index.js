import pgPromise from 'pg-promise';
import express from 'express';
import { engine } from "express-handlebars";
import bodyParser from "body-parser";
import flash from "express-flash";
import session from "express-session";
import dotenv from 'dotenv'

import FuelConsumption from './fuel-consumption.js';
import FuelConsumptionAPI from './routes/fuel-consumption-api.js';

dotenv.config();

const connection = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
}

const pgp = pgPromise();
const db = pgp(connection);

const fuelConsumption = FuelConsumption(db);
 const fuelConsumptionAPI = FuelConsumptionAPI(fuelConsumption)

// const pgp = pgPromise();
const app = express();
app.engine(
    "handlebars",
    engine({
      layoutsDir: "./views/layouts",
    })
  );
  
  app.set("view engine", "handlebars");
  app.set("views", "./views");
  
  // Set up static files and body parsing middleware
  app.use(express.static("public"));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  
  // Set up session middleware
  app.use(
    session({
      resave: false,
      saveUninitialized: true,
      secret: "Asiphe's",
    })
  );
  
  // Set up flash messages middleware
  app.use(flash());
  


const PORT = process.env.PORT || 3000;

app.use(express.json());

 app.get('/', fuelConsumptionAPI.vehicles);
app.post('/api/vehicles', fuelConsumptionAPI.vehicles);
// app.get('/api/vehicle', fuelConsumptionAPI.vehicle);
// app.post('/api/vehicle', fuelConsumptionAPI.addVehicle);
// app.get('/api/refuel', fuelConsumptionAPI.refuel);
// app.post('/api/refuel', fuelConsumptionAPI.refuel);

app.listen(PORT, () => console.log(`App started on port: ${PORT}`));


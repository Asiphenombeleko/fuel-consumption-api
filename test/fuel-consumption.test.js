// Import necessary modules and functions
import FuelConsumption from "../fuel-consumption.js";
import pgPromise from "pg-promise";
import assert from "assert";

// Create an instance of pgPromise
const pgp = pgPromise();

// Define the database connection string
const DATABASE_URL =
  "postgres://vfmymcph:ZMrOY-9fo32XGD4jtibz73hDeshb0zZx@ella.db.elephantsql.com/vfmymcph";

// Configure the database connection options
const config = {
  connectionString: DATABASE_URL,
};
// Add SSL configuration for production
if (process.env.NODE_ENV == "production") {
  config.ssl = {
    rejectUnauthorized: false,
  };
}

// Create a database instance using pgPromise and the configured options
const db = pgp(config);

// Describe the test suite for the FuelConsumption API
describe("The FuelConsumption API", function () {
  // Set a timeout for each test
  this.timeout(3000);

  // Run this function before each test
  this.beforeEach(async function () {
    // Clear the 'fuel_entries' and 'vehicles' tables before each test
    await db.none(`delete from fuel_entries`);
    await db.none(`delete from vehicles`);
  });

  // Test Case 1: Add a vehicle with no errors
  it("should be able to add a vehicle with no errors", async function () {
    // Create an instance of the FuelConsumption class with the database connection
    const fuelConsumption = FuelConsumption(db);

    // Get the initial list of vehicles and assert that it's empty
    let vehicles = await fuelConsumption.vehicles();
    assert.equal(0, vehicles.length);

    // Add a new vehicle
    const result = await fuelConsumption.addVehicle({
      regNumber: "CY 125-980",
      description: "Grey Toyota Etios",
    });

    // Assert that the result status is 'success'
    assert.equal("success", result.status);

    // Get the updated list of vehicles and assert that it contains one vehicle
    vehicles = await fuelConsumption.vehicles();
    assert.equal(1, vehicles.length);
  });

  // Test Case 2: Return an error if no reg number is given when adding a vehicle
  it("should be returning a error if no reg number given when adding a vehicle Vehicle", async function () {
    // Create an instance of the FuelConsumption class with the database connection
    const fuelConsumption = FuelConsumption(db);

    // Get the initial list of vehicles and assert that it's empty
    let vehicles = await fuelConsumption.vehicles();
    assert.equal(0, vehicles.length);

    // Attempt to add a new vehicle without a registration number
    const result = await fuelConsumption.addVehicle({
      // regNumber : "CY 125-90",
      description: "Grey Toyota Etios",
    });

    // Assert that the result status is 'error' and the message is as expected
    assert.equal("error", result.status);
    assert.equal("regNumber should not be blank", result.message);

    // Get the updated list of vehicles and assert that it's still empty
    vehicles = await fuelConsumption.vehicles();
    assert.equal(0, vehicles.length);
  });

  // Test Case: Return an error if an invalid reg number is given when adding a vehicle
  it("should be returning a error if invalid reg number given when adding a vehicle Vehicle", async function () {
    // Create an instance of the FuelConsumption class with the database connection
    const fuelConsumption = FuelConsumption(db);

    // Get the initial list of vehicles and assert that it's empty
    let vehicles = await fuelConsumption.vehicles();
    assert.equal(0, vehicles.length);

    // Attempt to add a new vehicle with an invalid registration number
    const result = await fuelConsumption.addVehicle({
      regNumber: "CY 12-90",
      description: "Grey Toyota Etios",
    });

    // Assert that the result status is 'error' and the message is as expected
    assert.equal("error", result.status);
    assert.equal(
      "regNumber is invalid - should by CA, CY, CF, CAA followed by 3 numbers - 3 numbers",
      result.message
    );
    // Get the updated list of vehicles and assert that it's still empty
    vehicles = await fuelConsumption.vehicles();
    assert.equal(0, vehicles.length);
  });

  // Test Case: Return a list of vehicles
  it("should be able to return a list of vehicles", async function () {
    const fuelConsumption = FuelConsumption(db);

    // Get the initial list of vehicles and assert that it's empty
    let vehicles = await fuelConsumption.vehicles();
    assert.equal(0, vehicles.length);

    // Add three vehicles
    await fuelConsumption.addVehicle({
      regNumber: "CY 125-905",
      description: "Grey Toyota Etios",
    });

    await fuelConsumption.addVehicle({
      regNumber: "CF 125-891",
      description: "White Toyota Etios",
    });

    await fuelConsumption.addVehicle({
      regNumber: "CA 275-959",
      description: "Grey VW Polo",
    });

    // Get the updated list of vehicles and assert that it contains three vehicles
    vehicles = await fuelConsumption.vehicles();
    assert.equal(3, vehicles.length);
  });

  // Test Case: Add fuel for a vehicle
  it("should be able to add fuel for a vehicle", async function () {
    //    create instance for the function fuelConsumption
    const fuelConsumption = FuelConsumption(db);

    // Add a vehicle
    const status = await fuelConsumption.addVehicle({
      regNumber: "CY 125-905",
      description: "Grey Toyota Etios",
    });

    const vehicleId = status.id;

    // Refuel the vehicle twice
    await fuelConsumption.refuel(vehicleId, 23, 560, 45011, true); // 23.50 per liter
    await fuelConsumption.refuel(vehicleId, 21, 493.5, 45690, true);

    // Get the updated vehicle information
    const vehicle = await fuelConsumption.vehicle(vehicleId);
    assert.equal(1053.5, vehicle.total_amount);
    assert.equal(44, vehicle.total_liters);

    // the fuel consumption is calculated like this
    // (45690 - 45011) / (23 + 21)
    // 679 kilometers / 44 liters
    // which is 15.43 kilometers for 1 liter
    // Calculated value
    assert.equal(15.43, vehicle.fuel_consumption);
  });

  // Test Case: Add fuel for another vehicle
  it("should be able to add fuel for another vehicle", async function () {
    // create instance for the function fuelConsumption
    const fuelConsumption = FuelConsumption(db);
    // Add another vehicle
    const status = await fuelConsumption.addVehicle({
      regNumber: "CF 354-117",
      description: "White Polo Vivo",
    });

    const vehicleId = status.id;

    // Refuel the other vehicle twice
    await fuelConsumption.refuel(vehicleId, 17, 722, 6130, true); // R23.50 per liter
    await fuelConsumption.refuel(vehicleId, 21, 493.5, 6708, true);
    // Get the updated vehicle information
    const vehicle = await fuelConsumption.vehicle(vehicleId);

    // Assert the total amount, total liters, and fuel consumption
    assert.equal(1215.5, vehicle.total_amount);
    assert.equal(38, vehicle.total_liters);
    // Calculated value
    assert.equal(15.21, vehicle.fuel_consumption);
  });

  // Test Case: No fuel consumption if one of the last 2 refuels was not a full refill
  it("should no fuel consumption if one of the last 2 refuels ws not a full refill", async function () {
    // create instance for the function fuelConsumption
    const fuelConsumption = FuelConsumption(db);

    // Add a vehicle
    const status = await fuelConsumption.addVehicle({
      regNumber: "CY 125-905",
      description: "Grey Toyota Etios",
    });

    const vehicleId = status.id;
    // Refuel the vehicle with one full and one partial refill
    await fuelConsumption.refuel(vehicleId, 23, 560, 45011, false); // 23.50 per liter
    await fuelConsumption.refuel(vehicleId, 21, 493.5, 45690, true);

    // Get the updated vehicle information
    const vehicle = await fuelConsumption.vehicle(vehicleId);
    // Assert the total amount, total liters, and fuel consumption (should be null)
    assert.equal(1053.5, vehicle.total_amount);
    assert.equal(44, vehicle.total_liters);

    // the fuel consumption is calculated like this
    assert.equal(null, vehicle.fuel_consumption);
  });
  // Run cleanup after all tests are completed
  after(db.$pool.end);
});

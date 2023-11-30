// vehicleService.js

// Define a function that returns an API object for Fuel Consumption
export default function FuelConsumptionAPI(fuelConsumption) {

    // Define an asynchronous function to handle adding a vehicle
    async function addVehicle(req, res) {
        // Extract description and regNumber from the request body
        const {description, regNumber} = req.body;
        
        // Log the request body
        console.log(req.body);

        // Call the addVehicle method from the fuelConsumption object
        const result  = await fuelConsumption.addVehicle({description, regNumber});

        // Render the "index" view with the result
        res.render("index", {
            result
        });
    }

    // Define an asynchronous function to handle fetching the list of vehicles
    async function vehicles(req, res) {
        // Call the vehicles method from the fuelConsumption object
        const vehicles = await fuelConsumption.vehicles();

        // Respond with a JSON object containing the status and data
        res.render("listcars", {
            vehicles
        });
    }

    //   
// 
    // Define an asynchronous function to handle fetching a specific vehicle
    async function vehicle(req, res) {
        // Extract the vehicle id from the query parameters
        const {id} = req.query;

        // Call the vehicle method from the fuelConsumption object
        const vehicle = await fuelConsumption.vehicle(id);

        // Respond with a JSON object containing the status and data
        res.render("record",{
           
            data: vehicle
        });
    }

    // Define an asynchronous function to handle refueling a vehicle
    async function refuel(req, res) {
        // Extract parameters from the request body
        const { vehicleId, liters, amount, distance, filledUp } = req.body;

        // Log the request body
        console.log(req.body);
        
        // Call the refuel method from the fuelConsumption object
        const status = await fuelConsumption.refuel(vehicleId, liters, amount, distance, filledUp);

        // Respond with a JSON object containing the refuel status
        res.render("record",{
            status
        });
    }

    // Return an object containing the functions to be used as API endpoints
    return {
        addVehicle,
        vehicle,
        vehicles,
        refuel
    }

}

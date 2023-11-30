create database fuel_consumption_app;
create role fuel login password 'fuel';
grant all privileges on database fuel_consumption_app to fuel;
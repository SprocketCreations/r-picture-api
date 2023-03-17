require("dotenv").config();
const express = require('express');
const formidableMiddleware = require('express-formidable-v2');
const allRoutes = require('./controllers');
const sequelize = require('./config/connection');
const { extractTokenMiddleware } = require("./utils/jwt");
//Cors is used to allow front-end connect to the back-end database (will be used latter)
const cors = require("cors");

// Sets up the Express App
// =============================================================
const app = express();
const PORT = process.env.PORT || 3001;

// Requiring our models for syncing
const { User } = require('./models');

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(extractTokenMiddleware);
app.use(cors());
app.use(formidableMiddleware());

app.use('/', allRoutes);

sequelize.sync({ force: false }).then(function () {
	app.listen(PORT, function () {
		console.log('App listening on PORT ' + PORT);
	});
});
# R Picture API

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Desktop |
:-----: |
![desktop view](/preview/desktop.jpg)


Mobile  | Side Panel
:-----: | :-----:
![mobile view](/preview/mobile_1.jpg) | ![mobile side panel view](/preview/mobile_2.jpg)

## Description

The backend api for the R Picture website. Uses a RESTful API to facilitate access to a mySQL database. Implements an express server with a custom middleware to parse Json Web Tokens. Uses the Sequelize ORM for mySQL query generation.

## Table of Contents

- [Live](#live)
- [Description](#description)
- [Installation](#installation)
- [Usage](#usage)
- [License](#license)
- [Questions](#questions)

## Live

You can visit the deployed frontend of the app at [r-picture.netlify.app](https://r-picture.netlify.app/)

## Installation

After cloning the api to your machine, you will need to run `npm install` to install all the dependencies. Using [`.env.EXAMPLE`](.env.EXAMPLE) as a reference, create a `.env` for the environment variables. You will need a mySQL database and a Cloudinary account.

## Usage

Run `npm start` to run the api. You can seed the database with random data for testing and demo purposes with `npm run seed`.

## License

This project is licensed under The MIT License

## Questions

My github: [SprocketCreations](https://github.com/SprocketCreations)




const axios = require("axios");
const { BookingRepository } = require("../repositories");
const db = require("../models");
const { FLIGHT_SERVICE } = require("../config/server-config");
const AppError = require("../utils/error/app-error");
const { StatusCodes } = require("http-status-codes");

async function createBooking(data) {
  return new Promise((resolve, reject) => {
    const result = db.sequelize.transaction(async function bookingImp(t) {
      const flight = await axios.get(
        `${FLIGHT_SERVICE}/api/v1/flight/${data.flightId}`
      );
      const flightData = flight.data.data;
      if (data.noOfSeats > flightData.totalSeats) {
        reject(
          new AppError("Not enough seats available", StatusCodes.BAD_REQUEST)
        );
      }
      resolve(true);
    });
  });
}

module.exports = {
  createBooking,
};

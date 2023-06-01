const axios = require("axios");
const db = require("../models");
const { FLIGHT_SERVICE } = require("../config/server-config");
const AppError = require("../utils/error/app-error");
const { StatusCodes } = require("http-status-codes");
const { BookingRepository } = require("../repositories");

const bookingRepository = new BookingRepository();

async function createBooking(data) {
  const transaction = await db.sequelize.transaction();
  try {
    const flight = await axios.get(
      `${FLIGHT_SERVICE}/api/v1/flight/${data.flightId}`
    );
    const flightData = flight.data.data;
    if (data.noOfSeats > flightData.totalSeats) {
      throw new AppError("Not enough seats available", StatusCodes.BAD_REQUEST);
    }

    const totalBillingAmount = data.noOfSeats * flightData.price;
    const bookingPayload = { ...data, totalCost: totalBillingAmount };
    console.log("BOOKING STARTED");
    const booking = await bookingRepository.createBooking(bookingPayload, transaction);
    console.log("BOOKING FINISHED");

    await axios.patch(
      `${FLIGHT_SERVICE}/api/v1/flight/${data.flightId}/seats`, {
        seats: data.noOfSeats
      }
    );

    await transaction.commit();
    return booking;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

module.exports = {
  createBooking,
};

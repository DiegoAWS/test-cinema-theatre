//#region Make sure we got a filename on the command line.
if (process.argv.length < 3) {
  console.log("Usage:");
  console.log("node booking.js textFile-whith-the-booking-data");
  console.log();
  console.log("To see errors details, add -d flags at the end");
  console.log("Ex:");
  console.log();
  console.log("node script.js booking_requests -d");
  process.exit(1);
}
//#endregion

//#region Initial Conditions

var amountOfRows = 100;
var amountOfColumns = 50;

var initialSeats = Array(amountOfRows)
  .fill(null)
  .map(() => Array(amountOfColumns).fill(false));
// seats[Row][Column]=== false     ---------------->  seat Unoccupated, else Occupated

var initialAccumulator = {
  errors: [],
  seats: initialSeats,
};

//#endregion

//#region Helper Functions
function getSeatsFromBooking(bookingInfo) {
  var seats = [];

  for (var i = bookingInfo.ColumnStart; i <= bookingInfo.ColumnEnd; i++) {
    seats.push({ row: bookingInfo.RowStart, column: i });
  }

  return seats;
}

function isSeatsOccuped(seatsState, bookingSeats) {
  return bookingSeats.some(function (seat) {
    return seatsState[seat.row][seat.column];
  });
}

function isLeftingGaps(seatsState, bookingInfo) {
  var gapBeffore = false;
  var gapAffter = false;

  gapBeffore =
    bookingInfo.ColumnStart > 0 && //Booking has seat(s) before
    seatsState[bookingInfo.RowStart][bookingInfo.ColumnStart - 1] === false && //The seat before is empty
    (bookingInfo.ColumnStart === 1 || //Or it is one gap at the beggining of the row
      seatsState[bookingInfo.RowStart][bookingInfo.ColumnStart - 2] === true); //Or it has occuped seats before the gap

  gapAffter =
    bookingInfo.ColumnStart < amountOfColumns - 2 && //Booking has seat(s) after
    seatsState[bookingInfo.RowStart][bookingInfo.ColumnEnd + 1] === false && // The seat after is empty
    (bookingInfo.ColumnStart === amountOfColumns - 2 || //Or it is one gap at the end of the row
      seatsState[bookingInfo.RowStart][bookingInfo.ColumnEnd + 2] === true); //Or it has occuped seats after the gap

  return gapBeffore || gapAffter;
}

const { Console } = require("console");
//#endregion

//#region main Code
var fs = require("fs");

var filename = process.argv[2];

fs.readFile(filename, "utf8", function (err, textContent) {
  if (err) throw err;

  var textArray = textContent.split(/,(?:\r\n|\n)/);

  var bookingSystem = textArray.reduce(function (accumulator, item) {
    var line = item.match(
      /\((?<id>\d+),(?<RowStart>\d+):(?<ColumnStart>\d+),(?<RowEnd>\d+):(?<ColumnEnd>\d+)\)/
    );
    var data = line && line.groups;

    if (data) {
      // Checking the line follow the expected data pattern

      var booking = {
        id: data.id,
        RowStart: Number(data.RowStart),
        RowEnd: Number(data.RowEnd),
        ColumnStart: Math.min(Number(data.ColumnStart), Number(data.ColumnEnd)),
        ColumnEnd: Math.max(Number(data.ColumnStart), Number(data.ColumnEnd)),
      };
      //   Math.min and Math.max allow any order in the booking process

      var seatsAreOutTheTheaterCapacity =
        booking.ColumnStart < 0 ||
        booking.ColumnEnd < 0 ||
        booking.RowStart < 0 ||
        booking.RowEnd < 0 ||
        booking.ColumnStart > 50 ||
        booking.ColumnEnd > 50 ||
        booking.RowStart > 100 ||
        booking.RowEnd > 100;

      var seatsAreNotInTheSameRow = booking.RowStart !== booking.RowEnd;

      var moreThanFiveSeats = booking.ColumnEnd - booking.ColumnStart >= 5;

      var bookingSeats = getSeatsFromBooking(booking);

      var areTheBookingSeatsOccuped = isSeatsOccuped(
        accumulator.seats,
        bookingSeats
      );

      var areLeftingGaps = isLeftingGaps(accumulator.seats, booking);

      if (
        seatsAreOutTheTheaterCapacity ||
        seatsAreNotInTheSameRow ||
        moreThanFiveSeats ||
        areTheBookingSeatsOccuped ||
        areLeftingGaps
      ) {
        accumulator.errors.push({
          booking,
          errorCause: {
            seatsAreOutTheTheaterCapacity,
            seatsAreNotInTheSameRow,
            moreThanFiveSeats,
            areTheBookingSeatsOccuped,
            areLeftingGaps,
          },
        });
      } else {
        bookingSeats.forEach(function (item) {
          accumulator.seats[item.row][item.column] = true;
        });
      }
    }
    return accumulator;
  }, initialAccumulator);

  console.log("ERRORS: ", bookingSystem.errors.length);

  if (
    process.argv.length > 3 &&
    (process.argv[3] === "-d" || process.argv[3] === "-D")
  ) {
    console.log("ERRORS DETAILS:");
    console.log("-----------------------------");
    console.log(bookingSystem.errors);
  }
});

//#endregion

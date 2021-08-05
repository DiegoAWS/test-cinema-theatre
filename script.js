
var initialSeats =Array(100).fill(null).map(()=>Array(50).fill(false))


document.getElementById("inputfile").addEventListener("change", function () {
  const textFile = this.files[0];


  if (textFile?.size > 0) {
    var fr = new FileReader();


    fr.onload = function () {

        var initialAccumulator={
            errors:0,
            seats:initialSeats
        }

      var textArray = fr.result.split(/,(?:\r\n|\n)/);

      var totalErrors = textArray.reduce(function (accumulator, item) {
        var line = item.match(
          /\((?<id>\d+),(?<RowStart>\d+):(?<ColumnStart>\d+),(?<RowEnd>\d+):(?<ColumnEnd>\d+)\)/
        );
        var data = line && line.groups;
        if (data) {
          var seatsAreOutTheTheaterCapacity =
            data.ColumnStart < 0 ||
            data.ColumnEnd < 0 ||
            data.RowStart < 0 ||
            data.RowEnd < 0 ||
            data.ColumnStart > 50 ||
            data.ColumnEnd > 50 ||
            data.RowStart > 100 ||
            data.RowEnd > 100;

          var seatsAreNotInTheSameRow = data.RowStart !== data.RowEnd;

          var moreThanFiveSeats =
            Math.abs(data.ColumnEnd - data.ColumnStart) >= 5;


          if (
            seatsAreOutTheTheaterCapacity ||
            seatsAreNotInTheSameRow ||
            moreThanFiveSeats
          ) {

            accumulator.errors++
          }
          else{


          }
        }
        return accumulator;
      },initialAccumulator);




      console.log(totalErrors);
    };

    fr.readAsText(textFile);
  }
});

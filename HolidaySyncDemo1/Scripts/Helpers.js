'use strict';

///
/// Helpers
///
// Shim for IE8 to support date formatter (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString)
if (!Date.prototype.toISOString) {
    (function () {

        function pad(number) {
            if (number < 10) {
                return '0' + number;
            }
            return number;
        }

        Date.prototype.toISOString = function () {
            return this.getUTCFullYear() +
              '-' + pad(this.getUTCMonth() + 1) +
              '-' + pad(this.getUTCDate()) +
              'T' + pad(this.getUTCHours()) +
              ':' + pad(this.getUTCMinutes()) +
              ':' + pad(this.getUTCSeconds()) +
              '.' + (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
              'Z';
        };

    }());
}

// Static helper class
var Helpers = function () { };
Helpers.urlToArray = function (url) {
    var request = {};
    var pairs = url.substring(url.indexOf('?') + 1).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        request[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    }
    return request;
};

/// Grid helpers
// Setup our Grid
// Using https://github.com/mleibman/SlickGrid
Helpers.setupGrid = function (grid, options, columns, data) {
    var checkboxSelector = new Slick.CheckboxSelectColumn({
        cssClass: "slick-cell-checkboxsel"
    });
    columns.unshift(checkboxSelector.getColumnDefinition());

    grid = new Slick.Grid("#grid", data, columns, options);
    grid.setSelectionModel(new Slick.RowSelectionModel({ selectActiveRow: false }));
    grid.registerPlugin(checkboxSelector);
    data.setFilter(Helpers.bankHolidayFilter);
    
    return grid;
}

// Grid filter function
Helpers.bankHolidayFilter = function (item, args) {
    var inArray = $.grep(args.BankHoliday, function (value) { return value === item.BankHoliday; });

    if (inArray.length > 0) {
        return true;
    }
    return false;
};
Helpers.dateTimeFormatter = function (row, cell, value, columnDef, dataContext) {
    // Basic US date formatter with fallback to ISO 
    var dt = new Date(value);
    if (isNaN(dt))
        return value.split("T")[0];
    else
        return dt.format("MM/dd/yyyy");
};

// Update the grid contents
Helpers.updateGridContents = function (holidays, gridData, grid) {
    // Setup grid filters        
    gridData.setFilterArgs({
        BankHoliday: $("#filterInputs input:checked").map(function () { return this.value; }).get()
    });

    // First need to add a uniquie identifier to the data set (to support SlickGrid filtering)
    for (var i = 0; i < holidays.length; i++) {
        holidays[i].id = i;
    }

    // Now use the data
    gridData.setItems(holidays);

    // Redraw the grid
    gridData.refresh();
    grid.invalidateAllRows();
    grid.render();
    grid.resizeCanvas();
}

// Remove duplicate calendar exceptions
Helpers.removeDuplicates = function (selectedRows, data) {
    var exceptionsToImport = [];

    // Prepare the array of exceptions excluding duplicates
    for (var i = 0; i < selectedRows.length; i++) {
        // Get this selected row from the Grid
        var selectedHoliday = data.holidayData.getItem(selectedRows[i]);

        // Use jQuery grep function to get our selected enterprise calendar
        var entCalendar = $.grep(data.entCalendars, function (cal) {
            return cal.Id === data.calendarId;
        })[0];

        // Ensure that our exception date does not overlap with any existing exceptions
        var alreadyExist = $.grep(entCalendar.BaseCalendarExceptions.results, function (excep) {
            return excep.Finish <= selectedHoliday.Date && excep.Start >= selectedHoliday.Date;
        });

        if (alreadyExist.length === 0) {
            // Last check to make sure we don't add the same date twice 
            var newException = $.grep(exceptionsToImport, function (item) {
                return item.Date === selectedHoliday.Date;
            });

            if (newException.length === 0)
                exceptionsToImport.push(selectedHoliday);
        }
    }

    return exceptionsToImport;
}
'use strict';

///
/// Namespace & constructor
///
var HolidaySync = function () {
    // Instance data
    this.urlTokens = Helpers.urlToArray(location.href);
    this.data = new HolidaySync.DataModel();

    // Grid configuration
    this.grid = undefined;
    this.columns = [
        { id: "Name", name: "Name", field: "Descriptor" },
        { id: "Date", name: "Date", field: "Date", formatter: Helpers.dateTimeFormatter },
        { id: "BankHoliday", name: "BankHoliday", field: "BankHoliday" }
        ];
    this.options = {
        enableCellNavigation: true,
        syncColumnCellResize: true,
        forceFitColumns: true
    };
};



///
/// Data Model
///
HolidaySync.DataModel = function () {
    this.entCalendars = {};
    this.countryCodes = {};

    this.calendarId = '';
    this.country = '';
    this.fromDate = '';
    this.toDate = '';

    // Grid data
    this.holidayData = new Slick.Data.DataView();
};




///
/// Main code block, begin once the DOM is loaded
///
$(document).ready(function () {
    // Instantiate our object
    var holidaySync = new HolidaySync();

    
    // Setup our Grid
    // Using https://github.com/mleibman/SlickGrid
    holidaySync.grid = Helpers.setupGrid(holidaySync.grid, holidaySync.options, holidaySync.columns, holidaySync.data.holidayData);


    // Setup our page controls and events
    holidaySync.setupPageControls();

    
    // Populate our data model (Uncomment these in DEMO 2)
    holidaySync.getEntCalData();
    holidaySync.getCountries();

    
    // Button to get calendar exceptions
    $("#getDataBtn").click(Function.createDelegate(this, function () {
        if (!!holidaySync.data.fromDate && !!holidaySync.data.toDate && !!holidaySync.data.country)
            holidaySync.getHolidaysForDates(holidaySync.data.fromDate, holidaySync.data.toDate, holidaySync.data.country);
        else
            alert("Please select dates.");

    }));


    // Button to import selected exceptions
    $("#importBtn").click(Function.createDelegate(this, function () {
        var selectedRows = holidaySync.grid.getSelectedRows();

        // Use helper function to check for any duplicates before importing
        var exceptionsToImport = Helpers.removeDuplicates(selectedRows, holidaySync.data);

        // Import the exceptions
        if (exceptionsToImport.length > 0) {
            holidaySync.addCalendarException(holidaySync.data.calendarId, exceptionsToImport);
        }
        else {
            // Mark all existing
            holidaySync.grid.setSelectedRows([]);
            alert("All selected exceptions already exist.");
        }
    }));

});




///
/// Function prototype definitions
///

// Function to wire-up our UI
HolidaySync.prototype.setupPageControls = function () {

    // Create our jQuery UI Date picker controls
    $("#fromDatePicker").datepicker({
        showOn: "button",
        buttonImage: "/_layouts/15/images/calendar.gif",
        buttonImageOnly: true,
        onSelect: Function.createDelegate(this, function (dateText) {
            this.data.fromDate = dateText;
        })
    });

    $("#toDatePicker").datepicker({
        showOn: "button",
        buttonImage: "/_layouts/15/images/calendar.gif",
        buttonImageOnly: true,
        onSelect: Function.createDelegate(this, function (dateText) {
            this.data.toDate = dateText;
        })
    });

    // Setup our page event handlers
    $("#countrySelect").change(Function.createDelegate(this, function (event, data) {
        this.data.country = $("#countrySelect option:selected")[0].value;
    }));
    $("#eCalendarSelect").change(Function.createDelegate(this, function (event, data) {
        this.data.calendarId = $("#eCalendarSelect option:selected")[0].value;
    }));
};



///
/// Project Server REST & JSOM functions
///

// Function to retrive a list of Enterprise calendars and exceptions
HolidaySync.prototype.getEntCalData = function () {
    //Example: http://server/PWA/_api/ProjectServer/Calendars?$expand=BaseCalendarExceptions

    var url = _spPageContextInfo.webServerRelativeUrl + "/_api/ProjectServer/Calendars?$expand=BaseCalendarExceptions";

    $.ajax({
        url: url,
        type: "GET",
        context: this,
        contentType: "application/json",
        headers: { "ACCEPT": "application/json;odata=verbose" },
        success: function (data, status, xhr) {
            // Save our data
            this.data.entCalendars = data.d.results;

            // Populate our html dropdown list of calendars when data is ready
            for (var i = 0; i < this.data.entCalendars.length; i++) {
                $("#eCalendarSelect").append($('<option>', {
                    value: this.data.entCalendars[i].Id,
                    text: this.data.entCalendars[i].Name
                }));
            }
            // Also set the default value
            $("#eCalendarSelect").trigger("change");
        },
        error: function (error) {
            // Handle error
            alert("Error: " + error.statusText + " loading Enterprise Calendars");
        }
    });
};


// Get available countries from the web service
// Source: http://www.holidaywebservice.com/
HolidaySync.prototype.getCountries = function () {
    // Requires http://www.holidaywebservice.com in AppManifest Remote Endpoints

    var url = "http://www.holidaywebservice.com/HolidayService_v2/HolidayService2.asmx/GetCountriesAvailable";

    // Use the Cross Domain Helper
    this.crossDomainCall(this.urlTokens.SPHostUrl, url, Function.createDelegate(this, function (response) {
        // Save our data
        var xmlData = $.parseXML(response);

        //Using plugin: http://www.fyneworks.com/jquery/xml-to-json/
        var jsonData = $.xml2json(xmlData);
        this.data.countryCodes = jsonData.CountryCode;

        // Populate our dropdown list of Countries when data is ready
        for (var i = 0; i < this.data.countryCodes.length; i++) {
            $("#countrySelect").append($('<option>', {
                value: this.data.countryCodes[i].Code,
                text: this.data.countryCodes[i].Description
            }));
        }
        // Also set the default value
        $("#countrySelect").trigger("change");

    }), Function.createDelegate(this, function (status, error) {
        // Handle failures
        alert(error);
    }));
};


// SharePoint Cross domain library helper function
HolidaySync.prototype.crossDomainCall = function (SPHostUrl, callUrl, successCallback, failureCallback) {
    // Use the Cross Domain library 
    // Source: http://blogs.msdn.com/b/officeapps/archive/2012/11/29/solving-cross-domain-problems-in-apps-for-sharepoint.aspx
    $.getScript(SPHostUrl + "/_layouts/15/" + "SP.RequestExecutor.js", Function.createDelegate(this, function () {

        // First construct our JSOM request
        var clientContext = new SP.ClientContext.get_current();

        var crossDomainRequest = new SP.WebRequestInfo();

        crossDomainRequest.set_url(callUrl);
        crossDomainRequest.set_method("GET");

        var response = SP.WebProxy.invoke(clientContext, crossDomainRequest);

        // Execute our request with a callback function
        clientContext.executeQueryAsync(Function.createDelegate(this, function () {
            var statusCode = response.get_statusCode();

            // HTTP status success / failure determines which callback function to send our results to
            if (statusCode === 200) {
                // JavaScript functions are first-class objects (how cool!)
                successCallback(response.get_body());
            }
            else {
                failureCallback(statusCode, response.get_body());
            }
        }));
    }));
};


// Get Holidays from Web Service
HolidaySync.prototype.getHolidaysForDates = function (fromDate, toDate, country) {
    var startDate = new Date(fromDate);
    var endDate = new Date(toDate);

    var url = "http://www.holidaywebservice.com/HolidayService_v2/HolidayService2.asmx/GetHolidaysForDateRange" +
        "?countryCode=" + country + "&startDate=" + startDate.toISOString() + "&endDate=" + endDate.toISOString();


    // Show a loading message
    this.notifyMsg = SP.UI.Notify.addNotification('<img src="/_layouts/images/loadingcirclests16.gif" style="vertical-align: top;"/> Loading...', true);


    this.crossDomainCall(this.urlTokens.SPHostUrl, url, Function.createDelegate(this, function (response) {
        // Save our data
        var xmlData = $.parseXML(response);

        //Using plugin: http://www.fyneworks.com/jquery/xml-to-json/
        var jsonData = $.xml2json(xmlData);

        // Update the grid contents
        Helpers.updateGridContents(jsonData.Holiday, this.data.holidayData, this.grid);

        // Remove the notification msg
        SP.UI.Notify.removeNotification(this.notifyMsg);

    }), Function.createDelegate(this, function (status, error) {
        // Handle failures
        SP.UI.Notify.removeNotification(this.notifyMsg);
        alert(error);
    }));
};



// Function to add calendar exceptions via JSOM
HolidaySync.prototype.addCalendarException = function (calUid, exceptions) {
    // Show a progress message
    this.notifyMsg = SP.UI.Notify.addNotification('<img src="/_layouts/images/loadingcirclests16.gif" style="vertical-align: top;"/> Importing...', true);

    // Step 1 Get the Project Server context and objects
    var projContext = PS.ProjectContext.get_current();

    // Get our Calendar Collection
    var eCalColl = projContext.get_calendars();
    var eCalendar = eCalColl.getByGuid(calUid);
    var eCalBaseExcep = eCalendar.get_baseCalendarExceptions();
    //CSOM Ref (no JSOM): http://msdn.microsoft.com/en-us/library/office/microsoft.projectserver.client.calendarexceptioncollection_di_pj14mref_members.aspx


    // Step 2 Loop through and add each exception
    for (var i = 0; i < exceptions.length; i++) {
        // Create our Calendar Exception Info
        //http://msdn.microsoft.com/en-us/library/office/jj669390.aspx
        var excepInfo = new PS.CalendarExceptionCreationInformation();

        // Append the year to the name to prevent future duplicates
        var exName = exceptions[i].Descriptor + " " + new Date(exceptions[i].Date).getFullYear();

        // Set the exception properties
        excepInfo.set_name(exName);
        excepInfo.set_start(exceptions[i].Date);
        excepInfo.set_finish(exceptions[i].Date);

        // Finally add the exception to the collection
        eCalBaseExcep.add(excepInfo);
    }

    // Update the collection
    eCalColl.update();


    // Step 3 Asynchronously execute the update 
    projContext.executeQueryAsync(Function.createDelegate(this, function () {
        // Success update our grid and finish up
        this.grid.setSelectedRows([]);

        // Display the results and remove the progress msg
        SP.UI.Notify.addNotification("Exceptions added successfully", false);
        SP.UI.Notify.removeNotification(this.notifyMsg);

    }), Function.createDelegate(this, function (call, error) {
        // Handle Error
        SP.UI.Notify.removeNotification(this.notifyMsg);
        alert(error.get_message());
    }));
};

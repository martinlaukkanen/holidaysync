<%-- The following 4 lines are ASP.NET directives needed when using SharePoint components --%>

<%@ Page Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" MasterPageFile="~masterurl/default.master" Language="C#" %>

<%@ Register TagPrefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<%-- The markup and script in the following Content element will be placed in the <head> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderAdditionalPageHead" runat="server">
    <script type="text/javascript" src="../Scripts/jquery-1.9.1.js"></script>
    <script type="text/javascript" src="/_layouts/15/sp.runtime.js"></script>
    <script type="text/javascript" src="/_layouts/15/sp.js"></script>

    <!-- DEMO 1: Add Libraries -->
    <script type="text/javascript" src="/_layouts/15/ps.js"></script>
    <script type="text/javascript" src="../Scripts/libs/jquery-ui-1.10.3.custom.min.js"></script>
    <script type="text/javascript" src="../Scripts/libs/jquery.xml2json.js"></script>

    <link type="text/css" href="../Content/jquery-ui-1.10.3.custom.css" rel="stylesheet" />
    <link type="text/css" href="../Content/slick.grid.css" rel="stylesheet" />
    
    <script type="text/javascript" src="../Scripts/libs/jquery.event.drag-2.2.js"></script>   
    <script type="text/javascript" src="../Scripts/libs/slick.core.js"></script>
    <script type="text/javascript" src="../Scripts/libs/slick.grid.js"></script>    
    <script type="text/javascript" src="../Scripts/libs/slick.checkboxselectcolumn.js"></script>
    <script type="text/javascript" src="../Scripts/libs/slick.rowselectionmodel.js"></script>
    <script type="text/javascript" src="../Scripts/libs/slick.dataview.js"></script>
    
    <!-- Add your CSS styles to the following file -->
    <link rel="Stylesheet" type="text/css" href="../Content/App.css" />

    <!-- Add your JavaScript to the following file -->
    <script type="text/javascript" src="../Scripts/Helpers.js"></script>
    <script type="text/javascript" src="../Scripts/App.js"></script>
</asp:Content>

<%-- The markup in the following Content element will be placed in the TitleArea of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderPageTitleInTitleArea" runat="server">
    Holiday Sync
</asp:Content>

<%-- The markup and script in the following Content element will be placed in the <body> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderMain" runat="server">

    <!-- DEMO 1: HTML for our App -->
    <div class="HalfPage">
        <div class="ContentPane">
            <h2>Enterprise Calendar to Update</h2>
            <select id="eCalendarSelect">
            </select>

            <h2>Select Country</h2>
            <select id="countrySelect">
            </select>

            <h2>Date Range</h2>
            <div class="DatePickers">
                <div class="HalfPage">
                    <label>From:</label>
                    <input type="text" id="fromDatePicker" />
                </div>

                <div class="HalfPage">
                    <span class="RightHalf">
                        <label>To:</label>
                        <input type="text" id="toDatePicker" />                    
                    </span>
                </div>
            </div>

            <h2>Filter</h2>
            <div id="filterInputs" class="FilterOpts">                
                <!-- Filter checkboxes (should probably get available optioms dynamically from web service) -->
                <ul class='listColumns'>
                    <li><input id='Recognized' type='checkbox' value='Recognized' checked='checked' />Recognized</li>
                    <li><input id='NotRecognized' type='checkbox' value='NotRecognized' />Not Recognized</li>
                </ul>
            </div>
        </div>
    </div>
    
    <div class="HalfPage">
        <h2>Holidays to Import</h2>
        <div id="grid" class="grid"></div>
    </div>

    <div>
        <input type="button" id="importBtn" class="ImportButton" value="Import Selected" />
        <input type="button" id="getDataBtn" class="RetrieveButton" value="Get Holidays" />
    </div>
</asp:Content>

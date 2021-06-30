var plan = {
    plan_sheets: [ 'Plan', 'Plan2', 'Shop', '100g' ],
    filter_sheets: [ 'Plan', 'Plan2', 'Shop', '100g' ],
    prepare_sheets: [ 'Plan', 'Plan2' ],
    menu_sheets: [ 'Plan', 'Plan2' ],
    range: 'A4:BR200',
    actions: {
        filter: 'A3',
        prepare: 'AB3',
        menu: 'A1',
        date: 'AB1'
    },
    goal: {
        calories: 'AG1',
        fat: 'AH1',
        fiber: 'AP1',
        netcarbs: 'AT1',
        protein: 'AU1'
    },
    actual: {
        weight: 'AF1',
        body_fat: 'AF2',
        protein_k: 'AF3',
        calories: 'AG2',
        fat: 'AH2',
        fiber: 'AP2',
        netcarbs: 'AT2',
        protein: 'AU2'
    },
    column: {
        ingredient: 'A',
        product: 'B',
        filter_raw: 'G',
        category: 'H',
        subcategory: 'I',
        filter: 'V',
        grams: 'Z',
        serving: 'AA',
        calories: 'AG',
        manganese: 'BR',
    }
};

var log = {
    summary: 'LogS',
    details: 'LogD'
};

var mealIngredients = {
    'Coconut Oil': 1,
    'Fish Oil': .5,
    'Olive Oil': 4,

    'Chicken': 200,
    'Eggs': 5,

    'Arugula': 145,
    'Collard Greens': 100,
    'Romaine': 100,

    'Broccoli': 100,
    'Cauliflower': 100,

    'Mushrooms': 100,
    'Radish': 100,
    'Salsa': 4,
    'Serrano': 4,

    'Avocado': 140,

    'Mustard': 3,
    'Pumpkin': 20,
};


// Plan Query (in A4)
// - Plan Sheet A Column: Food Sheet "Ingredient" (Column A)
// - Plan Sheet B Column: Food Sheet "Product" (Column H)
// - Plan Sheet C Column: Food Sheet "Sale" (Column I)
// - Plan Sheet D Column: Food Sheet "Cost" (Column J)
// - Plan Sheet E Column: Food Sheet "Purchase" (Column G)
// - Plan Sheet F Column: Food Sheet "Nutrition" (Column N)
// - Plan Sheet G Column: Food Sheet "Filter" (Column D)
// - Plan Sheet H Column: Food Sheet "Category" (Column E)
// - Plan Sheet I Column: Food Sheet "SubCategory" (Column F)
// - Plan Sheet J Column: Food Sheet "Norm K" (Column O)
// =query(FoodWithHeader,"select A, H, I, J, G, N, D, E, F, O where C='1-Active'", 1)
//
// Second Query (in AB4):
// - Plan Sheet AB Column: Food Sheet "Unit" (Column P)
// =query(FoodWithHeader, "select P where C='1-Active'", 1)

// Colors used for threshold highlighting
var GREEN = '#b6d7a8';     // light green 2
var YELLOW = '#fff2cc';    // light yellow 3
var ORANGE = '#f4cccc';    // light red 3
var RED = '#e06666';       // light red 1


function onEdit(event) {

    // Determine if the event is on a sheet that we have callbacks registered
    var sheet = SpreadsheetApp.getActiveSheet();
    var sheetName = sheet.getName();
    if (!plan.filter_sheets.includes(sheetName)) {
        return;
    }


    // Get the row/column of the updated cell
    var row = event.range.getRow();
    var column = event.range.getColumn();


    // Change the filter (small, medium, or large)
    let filterActionCell = getCellInfo(plan.actions.filter);
    if (plan.filter_sheets.includes(sheetName) && row === filterActionCell.row && column === filterActionCell.column) {
        Logger.log('Filter action: ' + event.value);
        createSpreadsheetWideFilter(sheet);
        updateDate(sheet);
        filterAction(sheet, event.value);
        return;
    }


    // Filter to the ingredients that are part of the meal
    let prepareActionCell = getCellInfo(plan.actions.prepare);
    if (plan.prepare_sheets.includes(sheetName) && row === prepareActionCell.row && column === prepareActionCell.column) {
        Logger.log('Prepare action');
        createSpreadsheetWideFilter(sheet);
        updateDate(sheet);
        prepareAction(sheet);
        return;
    }


    // Execute one of the items in the actions menu
    let menuActionCell = getCellInfo(plan.actions.menu);
    if (plan.menu_sheets.includes(sheetName) && row === menuActionCell.row && column === menuActionCell.column) {

        if (event.value === 'Log') {
            Logger.log('Menu action: ' + event.value);
            createSpreadsheetWideFilter(sheet);
            logAction(sheet);
            return;
        }

        if (event.value === 'Clear') {
            Logger.log('Clear action: ' + event.value);
            updateDate(sheet);
            createSpreadsheetWideFilter(sheet);
            clearAction(sheet);
            return;
        }

        if (event.value === 'Populate') {
            Logger.log('Populate action: ' + event.value);
            updateDate(sheet);
            createSpreadsheetWideFilter(sheet);
            populateAction(sheet);
            return;
        }
    }


    // Color code aggregate nutrient actuals based on desired goals
    let servingColumn = getCellInfo(plan.column.serving).column;
    if (plan.prepare_sheets.includes(sheetName) && column === servingColumn) {
        updateDate(sheet);
        optimal(sheet, getCellInfo(plan.goal.calories), getCellInfo(plan.actual.calories), 150);
        optimal(sheet, getCellInfo(plan.goal.fat), getCellInfo(plan.actual.fat), 2.5);
        minimum(sheet, getCellInfo(plan.goal.fiber), getCellInfo(plan.actual.fiber), 0);
        maximum(sheet, getCellInfo(plan.goal.netcarbs), getCellInfo(plan.actual.netcarbs), 0);
        optimal(sheet, getCellInfo(plan.goal.protein), getCellInfo(plan.actual.protein), 2.5);
        return;
    }
}


// This function is called when any of the actions are invoked (with
// the exception of the menu/log action).  It determines the current
// date and sticks it into the date cell.  That date is then used when
// the summary and detailed logging occurs.  The idea is that if you
// log the day after your meal, you can update this value, and that's
// the value the summary and detailed logging will use instead.
function updateDate(sheet) {
    let date = Utilities.formatDate(new Date(), "America/Los_Angeles", "MM-dd-yy");
    let dateCell = getCellInfo(plan.actions.date);
    setCellValue(sheet, dateCell, date);
}


// The filter action changes which ingredients are listed, either the
// Small set, the Small+Medium set, or the Small+Medium+Large set.  In
// addition, any item that has a serving size > 0 is also displayed
// (it's automtically placed into the Small set).  This action also
// results in removing prepare's filter on the serving column if it
// was in place prior to invocation.
function filterAction(sheet, filter) {
    Logger.log('Filter Action');

    // The very first time the sheet is loaded into the browser
    // initialize the last filter
    if (!getProperty('lastFilter')) {
        Logger.log('Initializing lastFilter to Small');
        setProperty('lastFilter', 'Small');
    }

    applyFilter(sheet, filter);
}


// This little routine is separated out for reuse purposes, it is
// called by the normal filter action, but also invoked during prepare
// deselection and after the logging action has completed.
function applyFilter(sheet, filter) {
    // If "prepare" was selected deselect it and remove its filter on
    // the serving column
    let prepareActionCell = getCellInfo(plan.actions.prepare);
    let prepareActionSelected = getCellValue(sheet, prepareActionCell);
    if (prepareActionSelected) {
        Logger.log('Removing prepare\'s serving column filter');
        setCellValue(sheet, prepareActionCell, false);
        removeFilterFromColumn(sheet, getColumn(plan.column.serving));
    }

    // Remove the prior filter on the filter column
    Logger.log('Removing the prior filter column\'s filter');
    let filterColumn = getColumn(plan.column.filter);
    removeFilterFromColumn(sheet, filterColumn);

    // Apply the new filter
    Logger.log('Applying new filter: ' + filter + ' (lastFilter: ' + getProperty('lastFilter') + ')');
    setProperty('lastFilter', filter);
    let filterActionCell = getCellInfo(plan.actions.filter);
    setCellValue(sheet, filterActionCell, filter);

    switch (filter) {
    case 'Small':
        filterValueOutOfColumn(sheet, filterColumn, [ 'Medium', 'Large', 'XLarge', 'Inactive' ]);
        break;
    case 'Medium':
        filterValueOutOfColumn(sheet, filterColumn, [ 'Large', 'XLarge', 'Inactive' ]);
        break;
    case 'Large':
        filterValueOutOfColumn(sheet, filterColumn, [ 'XLarge', 'Inactive' ]);
        break;
    case 'XLarge':
        filterValueOutOfColumn(sheet, filterColumn, [ 'Inactive' ]);
        break;
    }
}


// The prepare action is used to filter the ingredients down to just
// the list that have serving sizes > 0.  This is useful when it's
// time to prepare the meal as this list becomes the bill of
// materials!
function prepareAction(sheet) {
    Logger.log('Prepare Action');

    let prepareActionCell = getCellInfo(plan.actions.prepare);
    let prepareActionSelected = getCellValue(sheet, prepareActionCell);
    Logger.log('prepareActionSelected: ' + prepareActionSelected);
    if (prepareActionSelected) {
        // Steps:
        // 1. Remove the filter column's filter resulting in the full set of ingredients being listed
        // 2. Set the filter action cell's value to "Filter..." to indicate the prepare view has been selected
        // 3. Filter the serving column to list ingredients that have some number of servings specified > 0
        Logger.log('Prepare selected');

        Logger.log('Removing the filter column\'s filter');
        let filterColumn = getColumn(plan.column.filter);
        removeFilterFromColumn(sheet, filterColumn);
        let filterActionCell = getCellInfo(plan.actions.filter);
        setCellValue(sheet, filterActionCell, 'Filter...');

        Logger.log('Applying prepare\'s filter to the serving column');
        let servingColumn = getCellInfo(plan.column.serving).column;
        filterEmptyCellsOutOfColumn(sheet, servingColumn);
    } else {
        Logger.log('Prepare deselected');
        Logger.log('Removing prepare\'s serving column filter');
        removeFilterFromColumn(sheet, getColumn(plan.column.serving));
        applyFilter(sheet, getProperty('lastFilter'));
    }
}


function clearAction(sheet) {
    Logger.log('Clear Action');

    let range = getRangeInfo(plan.range);
    let servingColumn = getColumn(plan.column.serving);
    sheet.getRange(range.topLeft.row + 1, servingColumn, range.bottomRight.row - range.topLeft.row).clear({ contentsOnly: true });

    let menuActionCell = getCellInfo(plan.actions.menu);
    setCellValue(sheet, menuActionCell, 'Menu...');

    applyFilter(sheet, getProperty('lastFilter'));
}


function populateAction(sheet) {
    Logger.log('Populate Action');

    let range = getRangeInfo(plan.range);
    let servingColumn = getColumn(plan.column.serving);
    sheet.getRange(range.topLeft.row + 1, servingColumn, range.bottomRight.row - range.topLeft.row).clear({ contentsOnly: true });

    let ingredientColumn = getColumn(plan.column.ingredient);
    let filterRawColumn = getColumn(plan.column.filter_raw);
    let ingredientNames = sheet.getRange(range.topLeft.row + 1, ingredientColumn, range.bottomRight.row).getValues();
    Logger.log('ingredientNames: ' + ingredientNames);
    for (let ingredientName of Object.keys(mealIngredients)) {
        Logger.log('Populating ingredient: [' + ingredientName + ']');

        found = false;
        for (let row = 0; row < ingredientNames.length; row++) {

            // Get the value of the cell which will be the name of the
            // food item, although some of these can be blank because
            // we have fetched PLAN_MAX_ITEMS from the sheet
            let cellValue = ingredientNames[row][0];
            if (!cellValue) {
                continue;
            }

            Logger.log('cellValue: ' + ingredientName);
            Logger.log('row: ' + row + range.topLeft.row + 1);
            Logger.log('column: ' + filterRawColumn);
            let filter = getCellValue(sheet, { row: row + range.topLeft.row + 1, column: filterRawColumn });
            if (cellValue == ingredientName && filter !== 'Inactive') {
                Logger.log('cellValue: ' + ingredientName);
                Logger.log('filter: ' + filter);
                setCellValue(sheet, { row: row + range.topLeft.row + 1, column: servingColumn }, mealIngredients[ingredientName]);
                found = true;
                break;
            }
        }

        if (!found) {
            Logger.log('  - ERROR: The ingredient was not found');
        }
    }

    let menuActionCell = getCellInfo(plan.actions.menu);
    setCellValue(sheet, menuActionCell, 'Menu...');

    applyFilter(sheet, getProperty('lastFilter'));
}


function logAction(sheet) {
    Logger.log('Log Action');

    // Get the data from the spreadsheet and the current date
    let dateCell = getCellInfo(plan.actions.date);
    let range = getRangeInfo(plan.range);
    let date = getCellValue(sheet, dateCell);
    let data = sheet.getRange(1, 1, range.bottomRight.row, range.bottomRight.column).getValues();

    logSummary(sheet, data, date);
    logDetails(sheet, data, date);

    let menuActionCell = getCellInfo(plan.actions.menu);
    setCellValue(sheet, menuActionCell, 'Menu...');

    applyFilter(sheet, getProperty('lastFilter'));
}


function logSummary(sheet, data, date) {
    Logger.log('Logging summary');
    let logSummarySheet = getSheet(log.summary);

    let values = [ date ];

    let weightCell = getCellInfo(plan.actual.weight);
    values.push(data[weightCell.row - 1][weightCell.column - 1]);

    let bodyFatCell = getCellInfo(plan.actual.body_fat);
    values.push(data[bodyFatCell.row - 1][bodyFatCell.column - 1]);

    let proteinKCell = getCellInfo(plan.actual.protein_k);
    values.push(data[proteinKCell.row - 1][proteinKCell.column - 1]);

    let calorieColumn  = getColumn(plan.column.calories);
    for (let column = calorieColumn; column <= getColumn(plan.column.manganese); column++) {
        values.push(data[1][column - 1]);
        if (column === calorieColumn ||
            column === (calorieColumn + 1) ||
            column === (calorieColumn + 1) ||
            column === (calorieColumn + 9) ||
            column === (calorieColumn + 13) ||
            column === (calorieColumn + 14)) {
            values.push(data[0][column - 1]);
        }
    }
    Logger.log('Logging ' + values);
    setRowValues(logSummarySheet, logSummarySheet.getDataRange().getLastRow() + 1, 1, [ values ]);
}


function logDetails(sheet, data, date) {
    Logger.log('Logging details');

    // Log the detailed information into the LogDetail sheet
    let logDetailsSheet = getSheet(log.details);
    let lastRow = logDetailsSheet.getDataRange().getLastRow() + 1;
    Logger.log('Logging details in the ' + log.details + ' sheet beginning on row: ' + lastRow);


    let servingColumn = getColumn(plan.column.serving);
    let ingredientColumn = getColumn(plan.column.ingredient);
    let productColumn = getColumn(plan.column.product);
    let categoryColumn = getColumn(plan.column.category);
    let subcategoryColumn = getColumn(plan.column.subcategory);
    let gramsColumn = getColumn(plan.column.grams);
    let caloriesColumn = getColumn(plan.column.calories);
    let range = getRangeInfo(plan.range);
    for (let row = range.topLeft.row; row < (range.bottomRight.row - 1); row++) {

        // Skip any food items with zero grams since they weren't part of the meal
        if (data[row][ingredientColumn - 1] === '' || !data[row][servingColumn - 1]) {
            continue;
        }
        Logger.log(data[row]);

        // Log (a) date and (b) name of the food
        let values = [ date, data[row][ingredientColumn - 1] ];

        for (let col = 0; col <= range.bottomRight.column; col++) {

            // Log all the required fields prior to the nutrition fields
            switch (col) {
            case (productColumn - 1):
            case (gramsColumn - 1):
                values.push(data[row][col]);
                continue;
            case (categoryColumn - 1):
            case (subcategoryColumn - 1):
                values.push(data[row][col].substring(data[row][col].indexOf('-') + 1));
                continue;
            }

            // Log all the nutrition fields (plus cost)
            if (col >= (caloriesColumn - 1)) {
                values.push(data[row][col]);
                continue;
            }
        }

        Logger.log(values);
        setRowValues(logDetailsSheet, lastRow++, 1, [ values ]);
    }
}


// The background of the actuals using the "maximum" algorithm are
// colored as follows:
// - GREEN if the actual <= the goal
// - YELLOW if the actual <= the goal + range
// - ORANGE if the actual <= the goal + (range * 2)
// - RED if the actual > the goal + (range * 2)
function maximum(sheet, goalCell, actualCell, range) {
    let goal = getCellValue(sheet, goalCell);
    let actual = getCellValue(sheet, actualCell);

    if (actual <= goal) {
        sheet.getRange(actualCell.row, actualCell.column).setBackground(GREEN);
        return;
    }

    if (actual <= (goal + range)) {
        sheet.getRange(actualCell.row, actualCell.column).setBackground(YELLOW);
        return;
    }

    if (actual <= (goal + (range * 2))) {
        sheet.getRange(actualCell.row, actualCell.column).setBackground(ORANGE);
        return;
    }

    sheet.getRange(actualCell.row, actualCell.column).setBackground(RED);
}


// The background of the actuals using the "optimal" algorithm are
// colored as follows:
// - GREEN  if the actual >= the goal - range       and <= goal + range
// - YELLOW if the actual >= the goal - (range * 2) and <= goal + (range * 2)
// - ORANGE if the actual >= the goal - (range * 3) and <= goal + (range * 3)
// - RED    if the actual <  the goal - (range * 3) and >  goal + (range * 3)
function optimal(sheet, goalCell, actualCell, thresholdRange) {
    let goal = getCellValue(sheet, goalCell);
    let actual = getCellValue(sheet, actualCell);

    // GREEN if the actual >= the goal - range and <= goal + range
    if (actual >= (goal - thresholdRange) && actual <= (goal + thresholdRange)) {
        sheet.getRange(actualCell.row, actualCell.column).setBackground(GREEN);
        return;
    }

    // YELLOW if the actual >= the goal - (range * 2) and <= goal + (range * 2)
    if (actual >= (goal - (thresholdRange * 2)) && actual <= (goal + (thresholdRange * 2))) {
        sheet.getRange(actualCell.row, actualCell.column).setBackground(YELLOW);
        return;
    }

    // ORANGE if the actual >= the goal - (range * 3) and <= goal + (range * 3)
    if (actual >= (goal - (thresholdRange * 3)) && actual <= (goal + (thresholdRange * 3))) {
        sheet.getRange(actualCell.row, actualCell.column).setBackground(ORANGE);
        return;
    }

    // RED if the actual < the goal - (range * 3) and > goal + (range * 3)
    sheet.getRange(actualCell.row, actualCell.column).setBackground(RED);
}


// The background of the actuals using the minimum algorithm are colored
// as follows:
// - GREEN if the actual >= the goal
// - YELLOW if the actual >= the goal - thresholdRange
// - ORANGE if the actual >= the goal - (thresholdRange * 2)
// - RED if the actual < the goal - (thresholdRange * 2)
function minimum(sheet, goalCell, actualCell, thresholdRange) {
    let goal = getCellValue(sheet, goalCell);
    let actual = getCellValue(sheet, actualCell);

    if (actual >= goal) {
        sheet.getRange(actualCell.row, actualCell.column).setBackground(GREEN);
        return;
    }

    if (actual >= (goal - thresholdRange)) {
        sheet.getRange(actualCell.row, actualCell.column).setBackground(YELLOW);
        return;
    }

    if (actual >= (goal - (thresholdRange * 2))) {
        sheet.getRange(actualCell.row, actualCell.column).setBackground(ORANGE);
        return;
    }

    sheet.getRange(actualCell.row, actualCell.column).setBackground(RED);
}


function getSheet(name) {
    return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}


function getCellValue(sheet, cell) {
    return sheet.getRange(cell.row, cell.column).getValue();
}


function setCellValue(sheet, cell, value) {
    let range = sheet.getRange(cell.row, cell.column);
    range.setValue(value);
}


function setRowValues(sheet, row, col, values) {
    let range = sheet.getRange(row, col, 1, values[0].length);
    range.setValues(values);
}


// TODO: I need to recall why I'm creating a filter
function createSpreadsheetWideFilter(sheet) {
    if (!sheet.getFilter()) {
        sheet.getRange(plan.range).createFilter();
    }
}


function filterValueOutOfColumn(sheet, column, values) {
    sheet.getFilter().setColumnFilterCriteria(column, SpreadsheetApp.newFilterCriteria().setHiddenValues(values).build());
}


function filterEmptyCellsOutOfColumn(sheet, column) {
    sheet.getFilter().setColumnFilterCriteria(column, SpreadsheetApp.newFilterCriteria().whenCellNotEmpty().build());
}


function removeFilterFromColumn(sheet, column) {
    sheet.getFilter().removeColumnFilterCriteria(column);
}


function getProperty(name) {
    return PropertiesService.getScriptProperties().getProperty(name);
}


function setProperty(name, value) {
    PropertiesService.getScriptProperties().setProperty(name, value);
}


function getRangeInfo(range) {
    let topLeft = range.substring(0, range.indexOf(':'));
    console.log(topLeft);
    let bottomRight = range.substring(range.indexOf(':') + 1);
    return {
        topLeft: getCellInfo(topLeft),
        bottomRight: getCellInfo(bottomRight)
    }
}


function getCellInfo(cell) {
    let count = 0;
    let columnString = '';
    for (let ch of cell) {
        if (ch >= 'A' && ch <= 'Z') {
            columnString += ch;
            count++;
        }
    }

    let column;
    switch (columnString.length) {
    case 1:
        column = columnString.charCodeAt(0) - 64;
        break;
    case 2:
        column = ((columnString.charCodeAt(0) - 64) * 26) + (columnString.charCodeAt(1) - 64);
        break;
    }

    let rowString = cell.substring(count);

    return {
        column: column,
        row: parseInt(rowString)
    }
}


function getColumn(cell) {
    let count = 0;
    let columnString = '';
    for (let ch of cell) {
        if (ch >= 'A' && ch <= 'Z') {
            columnString += ch;
            count++;
        }
    }

    let column;
    switch (columnString.length) {
    case 1:
        column = columnString.charCodeAt(0) - 64;
        break;
    case 2:
        column = ((columnString.charCodeAt(0) - 64) * 26) + (columnString.charCodeAt(1) - 64);
        break;
    }

    return column;
}

var plan = {
    range: 'A4:BR200',
    sheet: [ 'Plan', 'Plan2', 'Plan3', 'Plan4', 'Shop', '100g' ],
    action_cell: {
        'A1': {
            name: 'Menu',
            fx: menuAction,
        },
        'A3': {
            name: 'Ingredient Filter',
            fx: filterAction,
        },
        'AA1': {
            name: 'Log Date Freeze/Unfreeze',
            fx: dateAction,
        },
        'AA2': {
            name: 'Expand/Hide Metadata Section',
            fx: expandAction,
        },
        'AA3': {
            name: 'Filter/Unfilter Prepared Meal',
            fx: prepareAction,
        },
    },
    cell: {
        menu_dropdown: 'A1',
        filter_dropdown: 'A3',

        date_checkbox: 'AA1',
        date_value: 'AB1',

        expand_checkbox: 'AA2',
        expand_label: 'AB2',

        prepare_checkbox: 'AA3',

        calories_required_net_goal: 'AG1',
        fat_goal: 'AH1',
        fiber_goal: 'AP1',
        netcarbs_goal: 'AT1',
        protein_goal: 'AU1',

        calories_required_net_actual: 'AG2',
        fat_actual: 'AH2',
        fiber_actual: 'AP2',
        netcarbs_actual: 'AT2',
        protein_actual: 'AU2',

        weight: 'AD1',
        body_fat: 'AD2',
        calories_burned_exercise: 'AD3',
        calories_required_gross: 'AF1',
        calorie_deficit: 'AF2',
        protein_activity_level_ratio: 'AF3',
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
        fat: 'AH',
        fiber: 'AP',
        netcarbs: 'AT',
        protein: 'AU',
        manganese: 'BR',
    }
};

var log = {
    summary: 'LogS',
    details: 'LogD'
};

var mealIngredients = {
    'Magnesium': 1,
    'Vitamin-D': 1,

    'Coconut Oil': 1,
    'Fish Oil': .5,
    'Olive Oil': 4,

    'Chicken': 200,
    'Eggs': 5,

    'Arugula': 145,
    'Collard Greens': 100,
    'Romaine': 130,

    'Broccoli': 100,
    'Cauliflower': 100,

    'Mushrooms': 100,
    'Radish': 100,
    'Salsa': 4,
    'Serrano': 5,

    'Avocado': 140,

    'Mustard': 3,
    'Pumpkin': 10,
};


// Plan Query (in A4)
// - Plan Sheet A Column: Food Sheet "Ingredient" (Column A)
// - Plan Sheet B Column: Food Sheet "Product" (Column H)
// - Plan Sheet C Column: Food Sheet "Sale" (Column I)
// - Plan Sheet D Column: Food Sheet "Cost" (Column J)
// - Plan Sheet E Column: Food Sheet "Purchase" (Column G)
// - Plan Sheet F Column: Food Sheet "Nutrition" (Column N)
// - Plan Sheet G Column: Food Sheet "Filter" (Column C or D)
// - Plan Sheet H Column: Food Sheet "Category" (Column E)
// - Plan Sheet I Column: Food Sheet "SubCategory" (Column F)
// - Plan Sheet J Column: Food Sheet "Norm K" (Column O)
// =query(FoodWithHeader,"select A, H, I, J, G, N, C, E, F, O", 1)
// =query(FoodWithHeader,"select A, H, I, J, G, N, D, E, F, O", 1)
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

    // Determine if the event is on a sheet that we have callbacks
    // registered.  The only sheets w/callbacks registered are the
    // plan sheets.
    var sheet = SpreadsheetApp.getActiveSheet();
    var sheetName = sheet.getName();
    if (!plan.sheet.includes(sheetName)) {
        return;
    }

    let cellName = event.range.getA1Notation();
    if (plan.action_cell[cellName]) {
        action(plan.action_cell[cellName], sheet, event.value);
        return;
    }

    // Color code aggregate nutrient actuals based on desired goals
    if (getCellInfo(plan.column.serving).column === event.range.getColumn() && event.range.getRow() > 4) {
        action({ name: 'Apply Macro Tresholds', fx: thresholdAction }, sheet);
        return;
    }
}

function action(actionInfo, sheet, value) {

    // 1. Make sure the filter is created
    createSpreadsheetWideFilter(sheet);

    // 2. Log the action
    if (value) {
        Logger.log(actionInfo.name + ': ' + value);
    } else {
        Logger.log(actionInfo.name);
    }

    // 3. Invoke the action
    actionInfo.fx(sheet, value);

    // 4. Update the date used for logging unless it is frozen
    let dateCheckboxCell = getCellInfo(plan.cell.date_checkbox);
    let dateCheckboxSelected = getCellValue(sheet, dateCheckboxCell);
    if (!dateCheckboxSelected) {

        // Determine the current date and sticks it into the date
        // cell.  That date is then used when the summary and detailed
        // logging occurs.  The idea is that if you log the day after
        // your meal, you can update this value, and that's the value
        // the summary and detailed logging will use instead.
        let dateValue = Utilities.formatDate(new Date(), "America/Los_Angeles", "MM-dd-yy");
        let dateValueCell = getCellInfo(plan.cell.date_value);
        setCellValue(sheet, dateValueCell, dateValue);
    }
}

function menuAction(sheet, value) {
    if (value === 'Log') {
        logAction(sheet, value);
    } else if (value === 'Clear') {
        clearAction(sheet, value);
    } else if (value === 'Populate') {
        populateAction(sheet, value);
    }

    let menuDropdownCell = getCellInfo(plan.cell.menu_dropdown);
    setCellValue(sheet, menuDropdownCell, 'Menu...');
    applyFilter(sheet, getProperty('lastFilter'));
}

function logAction(sheet) {
    // Get the data from the spreadsheet and the current date
    let dateValueCell = getCellInfo(plan.cell.date_value);
    let date = getCellValue(sheet, dateValueCell);

    let range = getRangeInfo(plan.range);
    let data = sheet.getRange(1, 1, range.bottomRight.row, range.bottomRight.column).getValues();

    logSummary(sheet, data, date);
    logDetails(sheet, data, date);
}

function logSummary(sheet, data, date) {
    Logger.log('Logging summary');
    let logSummarySheet = getSheet(log.summary);

    let values = [ date ];

    let weightCell = getCellInfo(plan.cell.weight);
    Logger.log('weightCell: ', weightCell);
    values.push(data[weightCell.row - 1][weightCell.column - 1]);

    let bodyFatCell = getCellInfo(plan.cell.body_fat);
    values.push(data[bodyFatCell.row - 1][bodyFatCell.column - 1]);

    let caloriesBurnedExerciseCell = getCellInfo(plan.cell.calories_burned_exercise);
    values.push(data[caloriesBurnedExerciseCell.row - 1][caloriesBurnedExerciseCell.column - 1]);

    let caloriesRequiredGrossCell = getCellInfo(plan.cell.calories_required_gross);
    values.push(data[caloriesRequiredGrossCell.row - 1][caloriesRequiredGrossCell.column - 1]);

    let calorieDeficitCalories = getCellInfo(plan.cell.calorie_deficit);
    values.push(data[calorieDeficitCalories.row - 1][calorieDeficitCalories.column - 1]);

    let proteinActivityLevelRatioCell = getCellInfo(plan.cell.protein_activity_level_ratio);
    values.push(data[proteinActivityLevelRatioCell.row - 1][proteinActivityLevelRatioCell.column - 1]);

    let fatColumn = getColumn(plan.column.fat);
    let fiberColumn = getColumn(plan.column.fiber);
    let netcarbsColumn = getColumn(plan.column.netcarbs);
    let proteinColumn = getColumn(plan.column.protein);
    let caloriesColumn = getColumn(plan.column.calories);
    for (let column = caloriesColumn; column <= getColumn(plan.column.manganese); column++) {

        // Push the actuals for the column (between calories and manganese in the plan sheet)
        values.push(data[1][column - 1]);

        // For the primary macro columns, after the actual is recorded also record the goal
        switch (column) {
        case caloriesColumn:
        case fatColumn:
        case fiberColumn:
        case netcarbsColumn:
        case proteinColumn:
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

function clearAction(sheet) {
    let range = getRangeInfo(plan.range);
    let servingColumn = getColumn(plan.column.serving);
    sheet.getRange(range.topLeft.row + 1, servingColumn, range.bottomRight.row - range.topLeft.row).clear({ contentsOnly: true });
}

function populateAction(sheet) {
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
}

// The filter action changes which ingredients are listed, either the
// Small set, the Small+Medium set, or the Small+Medium+Large set.  In
// addition, any item that has a serving size > 0 is also displayed
// (it's automtically placed into the Small set).  This action also
// results in removing prepare's filter on the serving column if it
// was in place prior to invocation.
function filterAction(sheet, filter) {
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
    let prepareCheckboxCell = getCellInfo(plan.cell.prepare_checkbox);
    let prepareCheckboxSelected = getCellValue(sheet, prepareCheckboxCell);
    if (prepareCheckboxSelected) {
        Logger.log('Removing prepare\'s serving column filter');
        setCellValue(sheet, prepareCheckboxCell, false);
        removeFilterFromColumn(sheet, getColumn(plan.column.serving));
    }

    // Remove the prior filter on the filter column
    Logger.log('Removing the prior filter column\'s filter');
    let filterColumn = getColumn(plan.column.filter);
    removeFilterFromColumn(sheet, filterColumn);

    // Apply the new filter
    Logger.log('Applying new filter: ' + filter + ' (lastFilter: ' + getProperty('lastFilter') + ')');
    setProperty('lastFilter', filter);
    let filterActionCell = getCellInfo(plan.cell.filter_dropdown);
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
    case 'Inactive':
        break;
    }
}

function expandAction(sheet) {
    let expandLabelCell = getCellInfo(plan.cell.expand_label);
    let expandLabel = getCellValue(sheet, expandLabelCell);
    Logger.log('expandLabel: ' + expandLabel);
    if (expandLabel === 'Expand') {
        Logger.log('Expanding...');
        sheet.showColumns(3, 24);
        setCellValue(sheet, expandLabelCell, 'Hide');
    } else {
        Logger.log('Hiding...');
        sheet.hideColumns(3, 24);
        setCellValue(sheet, expandLabelCell, 'Expand');
    }

    Logger.log('Deselecting the checkbox...');
    let expandCheckboxCell = getCellInfo(plan.cell.expand_checkbox);
    setCellValue(sheet, expandCheckboxCell, '');
}

function dateAction(sheet) {
    let dateCheckboxCell = getCellInfo(plan.cell.date_checkbox);
    let dateCheckboxSelected = getCellValue(sheet, dateCheckboxCell);
    Logger.log('dateCheckboxSelected: ' + dateCheckboxSelected);
}

// The prepare action is used to filter the ingredients down to just
// the list that have serving sizes > 0.  This is useful when it's
// time to prepare the meal as this list becomes the bill of
// materials!
function prepareAction(sheet) {
    let prepareCheckboxCell = getCellInfo(plan.cell.prepare_checkbox);
    let prepareCheckboxSelected = getCellValue(sheet, prepareCheckboxCell);
    Logger.log('prepareCheckboxSelected: ' + prepareCheckboxSelected);
    if (prepareCheckboxSelected) {
        // Steps:
        // 1. Remove the filter column's filter resulting in the full set of ingredients being listed
        // 2. Set the filter action cell's value to "Filter..." to indicate the prepare view has been selected
        // 3. Filter the serving column to list ingredients that have some number of servings specified > 0
        Logger.log('Prepare selected');

        Logger.log('Removing the filter column\'s filter');
        let filterColumn = getColumn(plan.column.filter);
        removeFilterFromColumn(sheet, filterColumn);
        let filterActionCell = getCellInfo(plan.cell.filter_dropdown);
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

function thresholdAction(sheet) {
    optimal(sheet, getCellInfo(plan.cell.calories_required_net_goal), getCellInfo(plan.cell.calories_required_net_actual), 150);
    optimal(sheet, getCellInfo(plan.cell.fat_goal), getCellInfo(plan.cell.fat_actual), 2.5);
    optimal(sheet, getCellInfo(plan.cell.protein_goal), getCellInfo(plan.cell.protein_actual), 2.5);
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

/**
 * Returns the minimmum required RDA.
 *
 * @param {String} name of the vitamin or mineral
 * @return {Number} RDA minimum requirement in mcg, mg, or IU units
 * @customfunction
 */
function rda(vitaminOrMineral, sex, age) {
    vitaminOrMineral = vitaminOrMineral.toLowerCase();

    if (vitaminOrMineral === 'om3(mg)' || vitaminOrMineral === 'om3') {
        return omega_3_min(sex, age);
    }

    if (vitaminOrMineral === 'vd(iu)' || vitaminOrMineral === 'vd') {
        return vitamin_d_min(sex, age);
    }

    if (vitaminOrMineral === 'ca(mg)' || vitaminOrMineral === 'ca') {
        return calcium_min(sex, age);
    }

    if (vitaminOrMineral === 'fe(mg)' || vitaminOrMineral === 'fe') {
        return iron_min(sex, age);
    }

    if (vitaminOrMineral === 'k(mg)' || vitaminOrMineral === 'k') {
        return potassium_min(sex, age);
    }

    if (vitaminOrMineral === 'va(iu)' || vitaminOrMineral === 'va') {
        return vitamin_a_min(sex, age);
    }

    if (vitaminOrMineral === 'vc(mg)' || vitaminOrMineral === 'vc') {
        return vitamin_c_min(sex, age);
    }

    if (vitaminOrMineral === 've(iu)' || vitaminOrMineral === 've') {
        return vitamin_e_min(sex, age);
    }

    if (vitaminOrMineral === 'vk(mcg)' || vitaminOrMineral === 'vk') {
        return vitamin_k_min(sex, age);
    }

    if (vitaminOrMineral === 'thiavb1(mg)' || vitaminOrMineral === 'thiavb1') {
        return thiamin_vitamin_vb1_min(sex, age);
    }

    if (vitaminOrMineral === 'ribovb2(mg)' || vitaminOrMineral === 'ribovb2') {
        return riboflavin_vitamin_vb2_min(sex, age);
    }

    if (vitaminOrMineral === 'niavb3(mg)' || vitaminOrMineral === 'niavb3') {
        return niacin_vitamin_vb3_min(sex, age);
    }

    if (vitaminOrMineral === 'vb6(mg)' || vitaminOrMineral === 'vb6') {
        return vitamin_b6_min(sex, age);
    }

    if (vitaminOrMineral === 'folate(mcg)' || vitaminOrMineral === 'folate') {
        return folate_min(sex, age);
    }

    if (vitaminOrMineral === 'vb12(mcg)' || vitaminOrMineral === 'vb12') {
        return vitamin_b12_min(sex, age);
    }

    if (vitaminOrMineral === 'pantovb5(mg)' || vitaminOrMineral === 'pantovb5') {
        return pantothentic_acid_vitamin_vb5_min(sex, age);
    }

    if (vitaminOrMineral === 'p(mg)' || vitaminOrMineral === 'p') {
        return phosphorous_min(sex, age);
    }

    if (vitaminOrMineral === 'mg(mg)' || vitaminOrMineral === 'mg') {
        return magnesium_min(sex, age);
    }

    if (vitaminOrMineral === 'zn(mg)' || vitaminOrMineral === 'zn') {
        return zinc_min(sex, age);
    }

    if (vitaminOrMineral === 'se(mcg)' || vitaminOrMineral === 'se') {
        return selenium_min(sex, age);
    }

    if (vitaminOrMineral === 'cu(mg)' || vitaminOrMineral === 'cu') {
        return copper_min(sex, age);
    }

    if (vitaminOrMineral === 'mn(mg)' || vitaminOrMineral === 'mn') {
        return manganese_min(sex, age);
    }

    return '';
}

function rda_max(vitaminOrMineral, sex, age) {
    vitaminOrMineral = vitaminOrMineral.toLowerCase();

    if (vitaminOrMineral === 'om3(mg)' || vitaminOrMineral === 'om3') {
        return omega_3_max(sex, age);
    }

    if (vitaminOrMineral === 'vd(iu)' || vitaminOrMineral === 'vd') {
        return vitamin_d_max(sex, age);
    }

    if (vitaminOrMineral === 'ca(mg)' || vitaminOrMineral === 'ca') {
        return calcium_max(sex, age);
    }

    if (vitaminOrMineral === 'fe(mg)' || vitaminOrMineral === 'fe') {
        return iron_max(sex, age);
    }

    if (vitaminOrMineral === 'k(mg)' || vitaminOrMineral === 'k') {
        return potassium_max(sex, age);
    }

    if (vitaminOrMineral === 'va(IU)' || vitaminOrMineral === 'va') {
        return vitamin_a_max(sex, age);
    }

    if (vitaminOrMineral === 'vc(mg)' || vitaminOrMineral === 'vc') {
        return vitamin_c_max(sex, age);
    }

    if (vitaminOrMineral === 've(iu)' || vitaminOrMineral === 've') {
        return vitamin_e_max(sex, age);
    }

    if (vitaminOrMineral === 'vk(mcg)' || vitaminOrMineral === 'vk') {
        return vitamin_k_max(sex, age);
    }

    if (vitaminOrMineral === 'thiavb1(mg)' || vitaminOrMineral === 'thiavb1') {
        return thiamin_vitamin_vb1_max(sex, age);
    }

    if (vitaminOrMineral === 'ribovb2(mg)' || vitaminOrMineral === 'ribovb2') {
        return riboflavin_vitamin_vb2_max(sex, age);
    }

    if (vitaminOrMineral === 'niavb3(mg)' || vitaminOrMineral === 'niavb3') {
        return niacin_vitamin_vb3_max(sex, age);
    }

    if (vitaminOrMineral === 'vb6(mg)' || vitaminOrMineral === 'vb6') {
        return vitamin_b6_max(sex, age);
    }

    if (vitaminOrMineral === 'folate(mcg)' || vitaminOrMineral === 'folate') {
        return folate_max(sex, age);
    }

    if (vitaminOrMineral === 'vb12(mcg)' || vitaminOrMineral === 'vb12') {
        return vitamin_b12_max(sex, age);
    }

    if (vitaminOrMineral === 'pantovb5(mg)' || vitaminOrMineral === 'pantovb5') {
        return pantothentic_acid_vitamin_vb5_max(sex, age);
    }

    if (vitaminOrMineral === 'p(mg)' || vitaminOrMineral === 'p') {
        return phosphorous_max(sex, age);
    }

    if (vitaminOrMineral === 'mg(mg)' || vitaminOrMineral === 'mg') {
        return magnesium_max(sex, age);
    }

    if (vitaminOrMineral === 'zn(mg)' || vitaminOrMineral === 'zn') {
        return zinc_max(sex, age);
    }

    if (vitaminOrMineral === 'se(mcg)' || vitaminOrMineral === 'se') {
        return selenium_max(sex, age);
    }

    if (vitaminOrMineral === 'cu(mg)' || vitaminOrMineral === 'cu') {
        return copper_max(sex, age);
    }

    if (vitaminOrMineral === 'mn(mg)' || vitaminOrMineral === 'mn') {
        return manganese_max(sex, age);
    }

    return 'Unknown vitamin/mineral';
}

function omega_3_min(sex, age) {
    if (age <= 1) return 500;
    if (age < 4) return 700;
    if (age < 9) return 900;
    if (age < 14 && sex === 'Male') return 1200;
    if (age < 14 && sex === 'Female') return 1000;
    if (sex === 'Male') return 1600;
    if (sex === 'Female') return 1100;
}

function omega_3_max(sex, age) {
    return '';
}

// https://ods.od.nih.gov/factsheets/VitaminD-Consumer
// https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional
// IU
function vitamin_d_min(sex, age) {
    if (age <= 1) return 400;
    if (age < 71) return 600;
    return 800;
}

function vitamin_d_max(sex, age) {
    if (age <= 0.5) return 1000;
    if (age <= 1) return 1500;
    if (age < 4) return 2500;
    if (age < 9) return 3000;
    return 4000;
}

// https://ods.od.nih.gov/factsheets/Calcium-Consumer
// https://ods.od.nih.gov/factsheets/Calcium-HealthProfessional
// mg
function calcium_min(sex, age) {
    if (age <= 0.5) return 200;
    if (age <= 1) return 260;
    if (age < 4) return 700;
    if (age < 9) return 1000;
    if (age < 14) return 1300;
    if (age < 19) return 1300;
    if (age < 51) return 1000;
    if (age < 71 && sex === 'Male') return 1000;
    if (age < 71 && sex === 'Women') return 1200;
    return 1200;
}

// mg
function calcium_max(sex, age) {
    if (age <= 0.5) return 1000;
    if (age <= 1) return 1500;
    if (age < 9) return 2500;
    if (age < 19) return 3000;
    if (age < 51) return 2500;
    return 2000;
}

// https://ods.od.nih.gov/factsheets/Iron-Consumer
// https://ods.od.nih.gov/factsheets/Iron-HealthProfessional
// mg
function iron_min(sex, age) {
    if (age <= 0.5) return .27;
    if (age <= 1) return 11;
    if (age < 4) return 7;
    if (age < 9) return 10;
    if (age < 14) return 8;
    if (age < 19 && sex === 'Male') return 11;
    if (age < 19 && sex === 'Female') return 15;
    if (age < 51 && sex === 'Male') return 8;
    if (age < 51 && sex === 'Female') return 18;
    return 8;
}

function iron_max(sex, age) {
    if (age < 14) return 40;
    return 45;
}

// https://ods.od.nih.gov/factsheets/Potassium-Consumer
// https://ods.od.nih.gov/factsheets/Potassium-HealthProfessional
// mg
function potassium_min(sex, age) {
    if (age <= 0.5) return 400;
    if (age <= 1) return 860;
    if (age < 4) return 2000;
    if (age < 9) return 2300;
    if (age < 14 && sex === 'Male') return 2500;
    if (age < 14 && sex === 'Female') return 2300;
    if (age < 19 && sex === 'Male') return 3000;
    if (age < 19 && sex === 'Female') return 2300;
    if (sex === 'Male') return 3400;
    if (sex === 'Female') return 2600;
}

function potassium_max(sex, age) {
    return '';
}

// https://ods.od.nih.gov/factsheets/VitaminA-Consumer
// https://ods.od.nih.gov/factsheets/VitaminA-HealthProfessional
// mcg * 3.336 -> IU
function vitamin_a_min(sex, age) {
    if (age < 4) return 300 * 3.336;
    if (age < 9) return 400 * 3.336;
    if (age < 14) return 600 * 3.336;
    if (sex === 'Male') return 900 * 3.336;
    if (sex === 'Female') return 700 * 3.336;
}

function vitamin_a_max(sex, age) {
    if (age < 4) return 600 * 3.336;
    if (age < 9) return 900 * 3.336;
    if (age < 14) return 1700 * 3.336;
    if (age < 19) return 2800 * 3.336;
    return 3000 * 3.336;
}

// https://ods.od.nih.gov/factsheets/VitaminC-Consumer
// https://ods.od.nih.gov/factsheets/VitaminC-HealthProfessional
// mg
function vitamin_c_min(sex, age) {
    if (age <= 0.5) return 40;
    if (age <= 1) return 50;
    if (age < 4) return 15;
    if (age < 9) return 25;
    if (age < 14) return 45;
    if (age < 19 && sex === 'Male') return 75;
    if (age < 19 && sex === 'Female') return 65;
    if (sex === 'Male') return 90;
    if (sex === 'Female') return 75;
}

function vitamin_c_max(sex, age) {
    if (age <= 1) return 'TBD';
    if (age < 4) return 400;
    if (age < 9) return 650;
    if (age < 14) return 1200;
    if (age < 19) return 1800;
    return 2000;
}

// https://ods.od.nih.gov/factsheets/VitaminE-Consumer
// https://ods.od.nih.gov/factsheets/VitaminE-HealthProfessional
// iu
function vitamin_e_min(sex, age) {
    if (age <= 0.5) return 4 * 1.5;
    if (age <= 1) return 5 * 1.5;
    if (age < 4) return 6 * 1.5;
    if (age < 9) return 7 * 1.5;
    if (age < 14) return 11 * 1.5;
    return 15 * 1.5;
}

function vitamin_e_max(sex, age) {
    return '';
}

// https://ods.od.nih.gov/factsheets/VitaminK-Consumer
// https://ods.od.nih.gov/factsheets/VitaminK-HealthProfessional
// mcg
function vitamin_k_min(sex, age) {
    if (age <= 0.5) return 2;
    if (age <= 1) return 2.5;
    if (age < 4) return 30;
    if (age < 9) return 55;
    if (age < 14) return 60;
    if (age < 19) return 75;
    if (sex === 'Male') return 120;
    if (sex === 'Female') return 90;
}

function vitamin_k_max(sex, age) {
    return '';
}

// https://ods.od.nih.gov/factsheets/Thiamin-Consumer
// https://ods.od.nih.gov/factsheets/Thiamin-HealthProfessional
// mg
function thiamin_vitamin_vb1_min(sex, age) {
    if (age <= 0.5) return .2;
    if (age <= 1) return .3;
    if (age < 4) return .5;
    if (age < 9) return .6;
    if (age < 14) return .9;
    if (age < 19 && sex === 'Male') return 1.2;
    if (age < 19 && sex === 'Female') return 1.0;
    if (sex === 'Male') return 1.2;
    if (sex === 'Female') return 1.1;
}

function thiamin_vitamin_vb1_max(sex, age) {
    return '';
}

// https://ods.od.nih.gov/factsheets/Riboflavin-Consumer
// https://ods.od.nih.gov/factsheets/Riboflavin-HealthProfessional
// mg
function riboflavin_vitamin_vb2_min(sex, age) {
    if (age <= 0.5) return .3;
    if (age <= 1) return .4;
    if (age < 4) return .5;
    if (age < 9) return .6;
    if (age < 14) return .9;
    if (age < 19 && sex === 'Male') return 1.3;
    if (age < 19 && sex === 'Female') return 1.0;
    if (sex === 'Male') return 1.3;
    if (sex === 'Female') return 1.1;
}

function riboflavin_vitamin_vb2_max(sex, age) {
    return '';
}

// https://ods.od.nih.gov/factsheets/Niacin-Consumer
// https://ods.od.nih.gov/factsheets/Niacin-HealthProfessional
// mg
function niacin_vitamin_vb3_min(sex, age) {
    if (age <= 0.5) return 2;
    if (age <= 1) return 4;
    if (age < 4) return 6;
    if (age < 9) return 8;
    if (age < 14) return 12;
    if (sex === 'Male') return 16;
    if (sex === 'Female') return 14;
}

function niacin_vitamin_vb3_max(sex, age) {
    if (age <= 1) return 'TBD';
    if (age < 4) return 10;
    if (age < 9) return 15;
    if (age < 14) return 20;
    if (age < 19) return 30;
    return 35;
}

// https://ods.od.nih.gov/factsheets/VitaminB6-Consumer
// https://ods.od.nih.gov/factsheets/VitaminB6-HealthProfessional
// mg
function vitamin_b6_min(sex, age) {
    if (age <= 0.5) return .1;
    if (age <= 1) return .3;
    if (age < 4) return .5;
    if (age < 9) return .6;
    if (age < 14) return 1.0;
    if (age < 19 && sex == 'Male') return 1.3;
    if (age < 19 && sex == 'Female') return 1.2;
    if (age < 51) return 1.3;
    if (sex === 'Male') return 1.7;
    if (sex === 'Female') return 1.5;
}

function vitamin_b6_max(sex, age) {
    if (age <= 1) return 'TBD';
    if (age < 4) return 30;
    if (age < 9) return 40;
    if (age < 14) return 60;
    if (age < 19) return 80;
    return 100;
}

// https://ods.od.nih.gov/factsheets/Folate-Consumer
// https://ods.od.nih.gov/factsheets/Folate-HealthProfessional
// mcg
function folate_min(sex, age) {
    if (age <= 0.5) return 65;
    if (age <= 1) return 80;
    if (age < 4) return 150;
    if (age < 9) return 200;
    if (age < 14) return 300;
    return 400;
}

function folate_max(sex, age) {
    if (age <= 0.5) return 'TBD';
    if (age <= 1) return 'TBD';
    if (age < 4) return 300;
    if (age < 9) return 400;
    if (age < 14) return 600;
    if (age < 19) return 800;
    return 1000;
}

// https://ods.od.nih.gov/factsheets/VitaminB12-Consumer
// https://ods.od.nih.gov/factsheets/VitaminB12-HealthProfessional
// mcg
function vitamin_b12_min(sex, age) {
    if (age <= 0.5) return .4;
    if (age <= 1) return .5;
    if (age < 4) return .9;
    if (age < 9) return 1.2;
    if (age < 14) return 1.8;
    return 2.4;
}

function vitamin_b12_max(sex, age) {
    return '';
}

// https://ods.od.nih.gov/factsheets/PantothenicAcid-Consumer
// https://ods.od.nih.gov/factsheets/PantothenicAcid-HealthProfessional
// mg
function pantothentic_acid_vitamin_vb5_min(sex, age) {
    if (age <= 0.5) return 1.7;
    if (age <= 1) return 1.8;
    if (age < 4) return 2;
    if (age < 9) return 3;
    if (age < 14) return 4;
    return 5;
}

function pantothentic_acid_vitamin_vb5_max(sex, age) {
    return '';
}

// https://ods.od.nih.gov/factsheets/Phosphorus-Consumer
// https://ods.od.nih.gov/factsheets/Phosphorus-HealthProfessional
// mg
function phosphorous_min(sex, age) {
    if (age <= 0.5) return 100;
    if (age <= 1) return 275;
    if (age < 4) return 460;
    if (age < 9) return 500;
    if (age < 14) return 1250;
    if (age < 19) return 1250;
    return 700;
}

function phosphorous_max(sex, age) {
    if (age <= 1) return 'TBD';
    if (age < 9) return 3000;
    if (age < 71) return 4000;
    return 3000;
}

// https://ods.od.nih.gov/factsheets/Magnesium-Consumer
// https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional
// mg
function magnesium_min(sex, age) {
    if (age <= 0.5) return 30;
    if (age <= 1) return 75;
    if (age < 4) return 80;
    if (age < 9) return 130;
    if (age < 14) return 240;
    if (age < 19 && sex === 'Male') return 410;
    if (age < 19 && sex === 'Female') return 360;
    if (age < 31 && sex === 'Male') return 400;
    if (age < 31 && sex === 'Female') return 310;
    if (sex === 'Male') return 420;
    if (sex === 'Female') return 320;
}

function magnesium_max(sex, age) {
    return '';
    // These are the values for SUPPLEMENTAL Mg only!
    // if (age <= 1) return 'TBD';
    // if (age < 4) return 65;
    // if (age < 9) return 110;
    // return 350;
}

// https://ods.od.nih.gov/factsheets/Zinc-Consumer
// https://ods.od.nih.gov/factsheets/Zinc-HealthProfessional
// mg
function zinc_min(sex, age) {
    if (age <= 0.5) return 2;
    if (age <= 1) return 3;
    if (age < 4) return 3;
    if (age < 9) return 5;
    if (age < 14) return 8;
    if (age < 19 && sex === 'Male') return 11;
    if (age < 19 && sex === 'Female') return 9;
    if (sex === 'Male') return 11;
    if (sex === 'Female') return 8;
}

function zinc_max(sex, age) {
    if (age <= 0.5) return 4;
    if (age <= 1) return 5;
    if (age < 4) return 7;
    if (age < 9) return 12;
    if (age < 14) return 23;
    if (age < 19) return 34;
    return 40;
}

// https://ods.od.nih.gov/factsheets/Selenium-Consumer
// https://ods.od.nih.gov/factsheets/Selenium-HealthProfessional
// mcg
function selenium_min(sex, age) {
    if (age <= 0.5) return 15;
    if (age < 4) return 20;
    if (age < 9) return 30;
    if (age < 14) return 40;
    return 55;
}

function selenium_max(sex, age) {
    if (age <= 0.5) return 45;
    if (age <= 1) return 60;
    if (age < 4) return 90;
    if (age < 9) return 150;
    if (age < 14) return 280;
    return 400;
}

// https://ods.od.nih.gov/factsheets/Copper-Consumer
// https://ods.od.nih.gov/factsheets/Copper-HealthProfessional
// mg
function copper_min(sex, age) {
    if (age <= 1) return 200/1000;
    if (age < 4) return 340/1000;
    if (age < 9) return 440/1000;
    if (age < 14) return 700/1000;
    if (age < 19) return 890/1000;
    return 900/1000;
}

function copper_max(sex, age) {
    if (age <= 1) return 'TBD';
    if (age < 4) return 1000/1000;
    if (age < 9) return 3000/1000;
    if (age < 14) return 5000/1000;
    if (age < 19) return 8000/1000;
    return 10000/1000;
}

// https://ods.od.nih.gov/factsheets/Manganese-Consumer
// https://ods.od.nih.gov/factsheets/Manganese-HealthProfessional
// mg
function manganese_min(sex, age) {
    if (age <= 0.5) return .003;
    if (age <= 1) return .6;
    if (age < 4) return 1.2;
    if (age < 9) return 1.5;
    if (age < 14 && age === 'Male') return 1.9;
    if (age < 14 && age === 'Female') return 1.6;
    if (age < 19 && age === 'Male') return 2.2;
    if (age < 19 && age === 'Female') return 1.6;
    if (sex === 'Male') return 2.3;
    if (sex === 'Female') return 1.8;
}

function manganese_max(sex, age) {
    if (age <= 1) return 'TBD';
    if (age < 4) return 2;
    if (age < 9) return 3;
    if (age < 14) return 6;
    if (age < 19) return 9;
    return 11;
}

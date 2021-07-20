/**
 * Returns the minimmum required RDA.
 *
 * @param {String} name of the vitamin or mineral
 * @return {Number} RDA minimum requirement in mcg, mg, or IU units
 * @customfunction
 */
function rda(vitaminOrMineral, sex, age) {
    vitaminOrMineral = vitaminOrMineral.toLowerCase();

    if (vitaminOrMineral === 'omega-3(mg)' || vitaminOrMineral === 'om3(mg)') {
        return omega_3_min(sex, age);
    }

    if (vitaminOrMineral === 'vd(iu)') {
        return vitamin_d_min(sex, age);
    }

    if (vitaminOrMineral === 'ca(mg)') {
        return calcium_min(sex, age);
    }

    if (vitaminOrMineral === 'fe(mg)') {
        return iron_min(sex, age);
    }

    if (vitaminOrMineral === 'k(mg)') {
        return potassium_min(sex, age);
    }

    if (vitaminOrMineral === 'va(iu)') {
        return vitamin_a_min(sex, age);
    }

    if (vitaminOrMineral === 'vc(mg)') {
        return vitamin_c_min(sex, age);
    }

    if (vitaminOrMineral === 've(iu)') {
        return vitamin_e_min(sex, age);
    }

    if (vitaminOrMineral === 'vk(mcg)') {
        return vitamin_k_min(sex, age);
    }

    if (vitaminOrMineral === 'thiaminb1(mg)') {
        return thiaminb1_min(sex, age);
    }

    if (vitaminOrMineral === 'riboflavinb2(mg)') {
        return riboflavinb2_min(sex, age);
    }

    if (vitaminOrMineral === 'niacinb3(mg)') {
        return niacinb3_min(sex, age);
    }

    if (vitaminOrMineral === 'vb6(mg)') {
        return vitamin_b6_min(sex, age);
    }

    if (vitaminOrMineral === 'folate(mcg)') {
        return folate_min(sex, age);
    }

    if (vitaminOrMineral === 'vb12(mcg)') {
        return vitamin_b12_min(sex, age);
    }

    if (vitaminOrMineral === 'pantob5(mg)') {
        return pantothentic_acidb5_min(sex, age);
    }

    if (vitaminOrMineral === 'p(mg)') {
        return phosphorous_min(sex, age);
    }

    if (vitaminOrMineral === 'mg(mg)') {
        return magnesium_min(sex, age);
    }

    if (vitaminOrMineral === 'zn(mg)') {
        return zinc_min(sex, age);
    }

    if (vitaminOrMineral === 'se(mcg)') {
        return selenium_min(sex, age);
    }

    if (vitaminOrMineral === 'cu(mg)') {
        return copper_min(sex, age);
    }

    if (vitaminOrMineral === 'mn(mg)') {
        return manganese_min(sex, age);
    }

    return '';
}

function rda_max(vitaminOrMineral, sex, age) {
    vitaminOrMineral = vitaminOrMineral.toLowerCase();

    if (vitaminOrMineral === 'omega-3(mg)' || vitaminOrMineral === 'om3(mg)') {
        return omega_3_max(sex, age);
    }

    if (vitaminOrMineral === 'vd(iu)') {
        return vitamin_d_max(sex, age);
    }

    if (vitaminOrMineral === 'ca(mg)') {
        return calcium_max(sex, age);
    }

    if (vitaminOrMineral === 'fe(mg)') {
        return iron_max(sex, age);
    }

    if (vitaminOrMineral === 'k(mg)') {
        return potassium_max(sex, age);
    }

    if (vitaminOrMineral === 'va(IU)') {
        return vitamin_a_max(sex, age);
    }

    if (vitaminOrMineral === 'vc(mg)') {
        return vitamin_c_max(sex, age);
    }

    if (vitaminOrMineral === 've(iu)') {
        return vitamin_e_max(sex, age);
    }

    if (vitaminOrMineral === 'vk(mcg)') {
        return vitamin_k_max(sex, age);
    }

    if (vitaminOrMineral === 'thiaminb1(mg)') {
        return thiaminb1_max(sex, age);
    }

    if (vitaminOrMineral === 'riboflavinb2(mg)') {
        return riboflavinb2_max(sex, age);
    }

    if (vitaminOrMineral === 'niacinb3(mg)') {
        return niacinb3_max(sex, age);
    }

    if (vitaminOrMineral === 'vb6(mg)') {
        return vitamin_b6_max(sex, age);
    }

    if (vitaminOrMineral === 'folate(mcg)') {
        return folate_max(sex, age);
    }

    if (vitaminOrMineral === 'vb12(mcg)') {
        return vitamin_b12_max(sex, age);
    }

    if (vitaminOrMineral === 'pantob5(mg)') {
        return pantothentic_acidb5_max(sex, age);
    }

    if (vitaminOrMineral === 'p(mg)') {
        return phosphorous_max(sex, age);
    }

    if (vitaminOrMineral === 'mg(mg)') {
        return magnesium_max(sex, age);
    }

    if (vitaminOrMineral === 'zn(mg)') {
        return zinc_max(sex, age);
    }

    if (vitaminOrMineral === 'se(mcg)') {
        return selenium_max(sex, age);
    }

    if (vitaminOrMineral === 'cu(mg)') {
        return copper_max(sex, age);
    }

    if (vitaminOrMineral === 'mn(mg)') {
        return manganese_max(sex, age);
    }

    return '';
}

function omega_3_min(sex, age) {
    return 500;
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
function thiaminb1_min(sex, age) {
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

function thiaminb1_max(sex, age) {
    return '';
}

// https://ods.od.nih.gov/factsheets/Riboflavin-Consumer
// https://ods.od.nih.gov/factsheets/Riboflavin-HealthProfessional
// mg
function riboflavinb2_min(sex, age) {
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

function riboflavinb2_max(sex, age) {
    return '';
}

// https://ods.od.nih.gov/factsheets/Niacin-Consumer
// https://ods.od.nih.gov/factsheets/Niacin-HealthProfessional
// mg
function niacinb3_min(sex, age) {
    if (age <= 0.5) return 2;
    if (age <= 1) return 4;
    if (age < 4) return 6;
    if (age < 9) return 8;
    if (age < 14) return 12;
    if (sex === 'Male') return 16;
    if (sex === 'Female') return 14;
}

function niacinb3_max(sex, age) {
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
function pantothentic_acidb5_min(sex, age) {
    if (age <= 0.5) return 1.7;
    if (age <= 1) return 1.8;
    if (age < 4) return 2;
    if (age < 9) return 3;
    if (age < 14) return 4;
    return 5;
}

function pantothentic_acidb5_max(sex, age) {
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

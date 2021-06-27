// IU
function vitamin_d(sex, age) {
    if (age < 1) {
        return 400;
    }
    if (age < 71) {
        return 600;
    }

    return 800;
}

// IU
function vitamin_d_max(sex, age) {
    if (age <= 0.5) {
        return 1000;
    }
    if (age < 1) {
        return 1500;
    }
    if (age < 4) {
        return 2500;
    }
    if (age < 9) {
        return 3000;
    }

    return 4000;
}

// mg
function calcium(sex, age) {
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

function iron(sex, age) {
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

function potassium(sex, age) {
    if (age <= 0.5) return 400;
    if (age <= 1) return 860;
    if (age < 4) return 2000;
    if (age < 9) return 2300;
    if (age < 14 && sex === 'Male') return 2500;
    if (age < 14 && sex === 'Female') return 2300;
    if (age < 19 && sex === 'Male') return 3000;
    if (age < 19 && sex === 'Female') return 2300;
    if (age < 51 && sex === 'Male') return 3400;
    if (age < 51 && sex === 'Female') return 2600;
    if (sex === 'Male') return 3400;
    return 2600;
}

function potassium_max(sex, age) {
    return 'None';
}

function vitamin_c(sex, age) {
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
    if (age < 4) return 400;
    if (age < 9) return 650;
    if (age < 14) return 1200;
    if (age < 19) return 1800;
    return 2000;
}

function vitamin_d(age, sex) {
    if (age < 1) {
        return 400;
    }
    if (age < 71) {
        return 600;
    }

    return 800;
}

function vitamin_d_max(age, sex) {
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

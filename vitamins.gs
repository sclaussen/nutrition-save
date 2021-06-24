function vitamin_d(sex, age) {
    if (age < 1) {
        return 400;
    }
    if (age < 71) {
        return 600;
    }

    return 800;
}

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


Age     Male    Female  Pregnant        Lactating
0–6 months*     200 mg  200 mg
7–12 months*    260 mg  260 mg
1–3 years       700 mg  700 mg
4–8 years       1,000 mg        1,000 mg
9–13 years      1,300 mg        1,300 mg
14–18 years     1,300 mg        1,300 mg        1,300 mg        1,300 mg
19–50 years     1,000 mg        1,000 mg        1,000 mg        1,000 mg
51–70 years     1,000 mg        1,200 mg
71+ years       1,200 mg        1,200 mg


0–6 months      1,000 mg        1,000 mg
7–12 months     1,500 mg        1,500 mg
1–8 years       2,500 mg        2,500 mg
9–18 years      3,000 mg        3,000 mg        3,000 mg        3,000 mg
19–50 years     2,500 mg        2,500 mg        2,500 mg        2,500 mg
51+ years       2,000 mg        2,000 mg

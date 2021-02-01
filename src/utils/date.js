
export function getDateFormat(date) {
    return date.getFullYear() + '-' +
        ((date.getMonth()+1).toString().length === 1 ? "0" : "") + (date.getMonth() + 1) + '-' +
        (date.getDate().toString().length === 1 ? "0" : "") + date.getDate();
}

export function dateToString(date) {
    if (typeof date === "string")
        return date.substring(10, 0);
    else if (date instanceof Date)
        return date.getFullYear() + "-" + String(date.getMonth()+1).padStart(2, '0') +
            "-" + String(date.getDate()).padStart(2, '0');
    else
        return date.format("YYYY-MM-DD");
}

export function stringToDate(date) {
    if (typeof date === "string")
        return new Date(date);
    else if (date instanceof Date)
        return date;
    else
        return null;
}

export function getStartDate(date, duration) {
    if(date !== null){
        let newDate = new Date(date.getTime());
        switch(duration) {
            case null:
                newDate.setDate(date.getDate() - 7);
                break;
            case "3M":
                newDate.setMonth(date.getMonth() - 3);
                break;
            case "6M":
                newDate.setMonth(date.getMonth() - 6);
                break;
            case "1Y":
                newDate.setMonth(date.getMonth() - 12);
                break;
            case "2Y":
                newDate.setMonth(date.getMonth() - 24);
                break;
            case "3Y":
                newDate.setMonth(date.getMonth() - 36);
                break;
            default:
                break;
        }
        return newDate;
    }
    else{
        return null;
    }
}

export function stringDatetimeToStandardFormat(value) {
    return value.substring(0,10) + " " + value.substring(11,16);
}

export function getPastDate(years) {
    let date = new Date();
    let controlledYears = years > date.getFullYear() ? date.getFullYear() : years;
    date.setFullYear(date.getFullYear() - controlledYears);
    return date.toISOString().split('T')[0];
}

const isValidDateTime = (value) => {
    if (typeof value !== "string") {
        return false;
    }

    // ISO date-time must include timezone (Z or offset)
    const regex =
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

    if (!regex.test(value)) {
        return false;
    }

    const date = new Date(value);

    return !Number.isNaN(date.getTime());
};


// Calculate slot end time
const getEndTime = (slot) => {
    const startTime = new Date(slot.startsAt).getTime();

    return startTime + slot.durationMinutes * 60 * 1000;
};


// Check whether two slots overlap
const isOverlapping = (start1, end1, start2, end2) => {
    return start1 < end2 && start2 < end1;
};


module.exports = {
    isValidDateTime,
    getEndTime,
    isOverlapping
};

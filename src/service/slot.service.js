
const slotRepository = require("../repository/slot.repository");
const AppError = require("../utils/apperror");

const {
    isValidDateTime,
    getEndTime,
    isOverlapping
} = require("../utils/slot.utils");

const { randomUUID } = require("crypto");


// Check user role
const checkRole = (user, role) => {
    if (!user || user.role !== role) {
        throw new AppError(
            403,
            "FORBIDDEN",
            "You are not authorized to perform this action"
        );
    }
};


// CREATE SLOT
const createSlot = (user, data) => {
    checkRole(user, "recruiter");

    const { startsAt, durationMinutes } = data;

    // Validate date-time
    if (!isValidDateTime(startsAt)) {
        throw new AppError(
            400,
            "INVALID_DATE",
            "startsAt must be a valid ISO date-time with timezone"
        );
    }

    const startTime = new Date(startsAt).getTime();

    // Slot must be in the future
    if (startTime <= Date.now()) {
        throw new AppError(
            400,
            "INVALID_DATE",
            "Slot must be scheduled in the future"
        );
    }

    // Validate duration
    if (
        !Number.isInteger(durationMinutes) ||
        durationMinutes < 15 ||
        durationMinutes > 120
    ) {
        throw new AppError(
            400,
            "INVALID_DURATION",
            "Duration must be between 15 and 120 minutes"
        );
    }

    const endTime =
        startTime + durationMinutes * 60 * 1000;

    // Check recruiter overlapping slots
    const existingSlots = slotRepository.findAll();

    const conflict = existingSlots.some(slot => {
        if (slot.recruiterId !== user.id) {
            return false;
        }

        if (!["open", "booked"].includes(slot.status)) {
            return false;
        }

        return isOverlapping(
            startTime,
            endTime,
            new Date(slot.startsAt).getTime(),
            getEndTime(slot)
        );
    });

    if (conflict) {
        throw new AppError(
            409,
            "SLOT_CONFLICT",
            "Recruiter already has an overlapping slot"
        );
    }

    const newSlot = {
        id: randomUUID(),
        recruiterId: user.id,
        startsAt: new Date(startTime),
        durationMinutes,
        status: "open",
        candidateId: null,
        createdAt: new Date()
    };

    return slotRepository.create(newSlot);
};


// GET SLOTS
const getSlots = (user, query) => {
    const {
        from,
        to,
        status,
        page = "1",
        limit = "10"
    } = query;

    if (!user || !["recruiter", "candidate"].includes(user.role)) {
        throw new AppError(
            403,
            "FORBIDDEN",
            "Invalid user"
        );
    }

    // Only recruiters can filter by status
    if (status && user.role !== "recruiter") {
        throw new AppError(
            403,
            "FORBIDDEN",
            "Candidates cannot filter slots by status"
        );
    }

    // Validate status
    if (
        status &&
        !["open", "booked", "cancelled"].includes(status)
    ) {
        throw new AppError(
            400,
            "INVALID_STATUS",
            "Invalid slot status"
        );
    }

    // Validate date filters
    if (from && !isValidDateTime(from)) {
        throw new AppError(
            400,
            "INVALID_DATE",
            "Invalid from date"
        );
    }

    if (to && !isValidDateTime(to)) {
        throw new AppError(
            400,
            "INVALID_DATE",
            "Invalid to date"
        );
    }

    if (from && to && new Date(from) > new Date(to)) {
        throw new AppError(
            400,
            "INVALID_DATE_RANGE",
            "from cannot be later than to"
        );
    }

    // Validate pagination
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
        throw new AppError(
            400,
            "INVALID_PAGE",
            "Invalid page number"
        );
    }

    if (
        !Number.isInteger(limitNumber) ||
        limitNumber < 1 ||
        limitNumber > 50
    ) {
        throw new AppError(
            400,
            "INVALID_LIMIT",
            "Limit must be between 1 and 50"
        );
    }

    const now = Date.now();

    let slots = slotRepository.findAll();

    // Role-based filtering
    if (user.role === "recruiter") {
        slots = slots.filter(
            slot => slot.recruiterId === user.id
        );
    } else {
        slots = slots.filter(slot =>
            slot.status === "open" &&
            new Date(slot.startsAt).getTime() > now
        );
    }

    // Apply status filter
    if (status) {
        slots = slots.filter(
            slot => slot.status === status
        );
    }

    // Apply date filters
    if (from) {
        slots = slots.filter(
            slot => new Date(slot.startsAt) >= new Date(from)
        );
    }

    if (to) {
        slots = slots.filter(
            slot => new Date(slot.startsAt) <= new Date(to)
        );
    }

    // Sort by earliest start time
    slots.sort(
        (a, b) =>
            new Date(a.startsAt) - new Date(b.startsAt)
    );

    const total = slots.length;

    const startIndex = (pageNumber - 1) * limitNumber;

    const paginatedSlots = slots.slice(
        startIndex,
        startIndex + limitNumber
    );

    return {
        items: paginatedSlots,
        pagination: {
            page: pageNumber,
            limit: limitNumber,
            total,
            totalPages: Math.ceil(total / limitNumber)
        }
    };
};


// BOOK SLOT
const bookSlot = (user, slotId) => {
    checkRole(user, "candidate");

    const slot = slotRepository.findById(slotId);

    if (!slot) {
        throw new AppError(
            404,
            "SLOT_NOT_FOUND",
            "Slot not found"
        );
    }

    if (slot.status !== "open") {
        throw new AppError(
            409,
            "SLOT_UNAVAILABLE",
            "Slot is not available for booking"
        );
    }

    const candidateSlots = slotRepository.findAll();

    const candidateStart = new Date(slot.startsAt).getTime();
    const candidateEnd = getEndTime(slot);

    // Check candidate's existing bookings
    const conflict = candidateSlots.some(existing => {
        if (
            existing.candidateId !== user.id ||
            existing.status !== "booked"
        ) {
            return false;
        }

        return isOverlapping(
            candidateStart,
            candidateEnd,
            new Date(existing.startsAt).getTime(),
            getEndTime(existing)
        );
    });

    if (conflict) {
        throw new AppError(
            409,
            "BOOKING_CONFLICT",
            "You already have an overlapping interview"
        );
    }

    // Update slot
    const updatedSlot = {
        ...slot,
        status: "booked",
        candidateId: user.id
    };

    return slotRepository.update(slotId, updatedSlot);
};


// CANCEL SLOT
const cancelSlot = (user, slotId) => {
    const slot = slotRepository.findById(slotId);

    if (!slot) {
        throw new AppError(
            404,
            "SLOT_NOT_FOUND",
            "Slot not found"
        );
    }

    if (slot.status === "cancelled") {
        throw new AppError(
            409,
            "ALREADY_CANCELLED",
            "Slot is already cancelled"
        );
    }

    // Check ownership
    if (user.role === "candidate") {
        if (
            slot.candidateId !== user.id ||
            slot.status !== "booked"
        ) {
            throw new AppError(
                403,
                "FORBIDDEN",
                "You can only cancel your own booking"
            );
        }
    } else if (user.role === "recruiter") {
        if (slot.recruiterId !== user.id) {
            throw new AppError(
                403,
                "FORBIDDEN",
                "You can only cancel your own slots"
            );
        }
    } else {
        throw new AppError(
            403,
            "FORBIDDEN",
            "Invalid user role"
        );
    }

    // Cancellation must happen at least 2 hours before start
    const startTime = new Date(slot.startsAt).getTime();
    const twoHours = 2 * 60 * 60 * 1000;

    if (startTime - Date.now() <= twoHours) {
        throw new AppError(
            409,
            "CANCELLATION_NOT_ALLOWED",
            "Slots cannot be cancelled within 2 hours of starting"
        );
    }

    let updatedSlot;

    if (user.role === "candidate") {
        // Candidate cancellation releases the slot
        updatedSlot = {
            ...slot,
            status: "open",
            candidateId: null
        };
    } else {
        // Recruiter cancellation cancels the entire slot
        updatedSlot = {
            ...slot,
            status: "cancelled",
            candidateId: null
        };
    }

    return slotRepository.update(slotId, updatedSlot);
};


module.exports = {
    createSlot,
    getSlots,
    bookSlot,
    cancelSlot
};

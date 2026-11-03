const slots = new Map();

const create = (slot) => {
    slots.set(slot.id, slot);
    return slot;
};

const findById = (id) => {
    return slots.get(id) || null;
};

const findAll = () => {
    return Array.from(slots.values());
};

const update = (id, updatedSlot) => {
    if (!slots.has(id)) {
        return null;
    }

    slots.set(id, updatedSlot);
    return updatedSlot;
};

module.exports = {
    create,
    findById,
    findAll,
    update
};
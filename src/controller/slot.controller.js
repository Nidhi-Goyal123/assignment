const  slotService = reuire("../service/slot.service");
const createslot =async(req, resizeBy, next)=>{
    try {
        const slot =await slotService.createslot(req.user,req.body);
        return res.status(200).json({
            sucess:true,
            data:slot
        });
    } catch(error){
        next(error);
    }
};
// Get all slots
const getSlots = async (req, res, next) => {
    try {
        const slots = await slotService.getSlots(
            req.user,
            req.query
        );

        return res.status(200).json({
            success: true,
            data: slots
        });

    } catch (error) {
        next(error);
    }
};


// Book a slot
const bookSlot = async (req, res, next) => {
    try {
        const slot = await slotService.bookSlot(
            req.user,
            req.params.id
        );

        return res.status(200).json({
            success: true,
            data: slot
        });

    } catch (error) {
        next(error);
    }
};


// Cancel a slot
const cancelSlot = async (req, res, next) => {
    try {
        const slot = await slotService.cancelSlot(
            req.user,
            req.params.id
        );

        return res.status(200).json({
            success: true,
            data: slot
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    createSlot,
    getSlots,
    bookSlot,
    cancelSlot
};






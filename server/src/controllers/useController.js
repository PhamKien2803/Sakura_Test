const { Model } = require("mongoose");
const { HTTP_STATUS, RESPONSE_MESSAGE, USER_ROLES, VALIDATION_CONSTANTS } = require('../constants/useConstants');


const findAllGeneric = (Model, populateFields = []) => async (req, res) => {
    console.log("🚀 ~ findAllGeneric ~ Model:", Model)
    try {
        const { fields, ...filters } = req.query;

        const selectFields = fields ? fields.split(',').join(' ') : '';
        console.log("🚀 ~ findAllGeneric ~ selectFields11111111:", selectFields)
        if (Model.modelName !== 'WeeklyMenu') {
            console.log("🚀 ~ findAllGeneric ~ selectFields:", selectFields)
            filters.status = true;
        }

        let query = Model.find(filters).select(selectFields);
        console.log("🚀 ~ findAllGeneric ~ query:", query)
        populateFields.forEach((field) => {
            query = query.populate(field);
        });

        const data = await query.exec();
        console.log("🚀 ~ findAllGeneric ~ data:", data)

        res.status(HTTP_STATUS.OK).json({ data });
    } catch (err) {
        res.status(HTTP_STATUS.SERVER_ERROR).json({ message: err.message });
    }
};


const findIdGeneric = (Model, populateFields = []) => async (req, res) => {
    try {
        const { fields } = req.query;

        const selectFields = fields ? fields.split(',').join(' ') : '';

        let query = Model.findById(req.params.id).select(selectFields);

        populateFields.forEach((field) => {
            query = query.populate(field);
        });

        const data = await query.exec();

        if (!data) {
            return res.status(HTTP_STATUS.NOT_FOUND).json(RESPONSE_MESSAGE.NOT_FOUND);
        }

        res.status(HTTP_STATUS.OK).json({ data });
    } catch (err) {
        res.status(HTTP_STATUS.SERVER_ERROR).json({ message: err.message });
    }
};


const createGeneric = (Model, uniField = []) => async (req, res) => {
    try {
        if (uniField.length > 0) {
            const filter = {};
            for (const item of uniField) {
                if (req.body[item] !== undefined) {
                    filter[item] = req.body[item];
                }
            }

            filter.status = true;

            const existing = await Model.findOne(filter);

            if (existing) {
                return res.status(400).json({
                    message: `${RESPONSE_MESSAGE.UNIQUE_FIELDS}: ${Object.keys(filter)
                        .filter(key => key !== 'status')
                        .map(key => `${key}='${filter[key]}'`)
                        .join(', ')}`,
                });
            }
        }

        const newData = new Model(req.body);
        const savedData = await newData.save();

        res.status(HTTP_STATUS.CREATED).json({
            message: RESPONSE_MESSAGE.CREATED,
            data: savedData,
        });
    } catch (err) {
        res.status(HTTP_STATUS.SERVER_ERROR).json({ message: err.message });
    }
};

const deletedSoftGeneric = (Model) => async (req, res) => {
    try {
        const data = await Model.findById(req.params.id);
        if (!data) {
            return res.status(HTTP_STATUS.NOT_FOUND).json(RESPONSE_MESSAGE.NOT_FOUND);
        }
        data.status = false;
        await data.save();
        return res.status(HTTP_STATUS.OK).json(RESPONSE_MESSAGE.DELETED);
    } catch (err) {
        res.status(HTTP_STATUS.SERVER_ERROR).json({ message: err.message });
    }
}

const updateGeneric = (Model, modelName) => async (req, res) => {
    try {
        const updatedData = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!updatedData) {
            return res.status(HTTP_STATUS.NOT_FOUND).json(RESPONSE_MESSAGE.NOT_FOUND);
        }

        res.status(HTTP_STATUS.UPDATED).json(RESPONSE_MESSAGE.UPDATED);
    } catch (err) {
        res.status(HTTP_STATUS.SERVER_ERROR).json({ message: err.message });
    }
};



module.exports = {
    findAllGeneric,
    findIdGeneric,
    createGeneric,
    updateGeneric,
    deletedSoftGeneric
};

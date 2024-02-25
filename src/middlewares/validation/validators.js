const yup = require("yup");
const validate = async (req, res, next) => {
    try {
        const schema = yup.object().shape({
            firstName: yup.string(),
            lastName: yup.string(),
            email: yup.string().email(),
            yellowCards: number().positive().integer().min(0),
            redCards: yup.number().integer().min(0),
            goalsScored: yup.number().integer().min(0),
            cleanSheets: yup.number().integer().min(0),
            assist: yup.number().integer().min(0),
            logo: yup.string(),  
              });
        await schema.validate(req.body,{ abortEarly: false });
        next();
    } catch (error) {
        res.status(400).json({
            error: error.errors,
        });
    }
};
module.exports = validate;
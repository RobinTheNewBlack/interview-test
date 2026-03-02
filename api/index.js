"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const zod_1 = require("zod");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Zod Schema สำหรับข้อมูลส่วนตัวผู้สมัคร
const personalInfoSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    gender: zod_1.z.string().min(1, 'Gender is required'),
    dateOfBirth: zod_1.z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid date format (e.g., 1990-12-31)'
    }),
    age: zod_1.z.number().int('Age must be an integer').min(0, 'Age must be a positive number'),
    email: zod_1.z.string().email('Invalid email format'),
    position: zod_1.z.string().min(1, 'Position is required'),
    expectedSalary: zod_1.z.number().min(0, 'Expected salary must be a positive number')
});
app.post('/api/submit', (req, res) => {
    try {
        // Validate request body
        const validatedData = personalInfoSchema.parse(req.body);
        // จำลองการ Response ว่าข้อมูลบันทึกสำเร็จ
        return res.status(200).json({
            success: true,
            message: "Create new user successfully.",
            data: validatedData,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const zodError = error;
            return res.status(400).json({
                success: false,
                message: "Invalid data (Validation Failed)",
                // errors: zodError.errors.map((err) => ({
                //     field: err.path.join('.'),
                //     message: err.message
                // }))
            });
        }
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: "OK", message: "API is up and running!" });
});
exports.default = app;
//# sourceMappingURL=index.js.map
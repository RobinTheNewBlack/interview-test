import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { z } from 'zod';

const app = express();

app.use(cors());

// Handle body parsing for both Local and Vercel environments
app.use((req: Request, res: Response, next: NextFunction) => {
    // In Vercel serverless functions, req.body is already parsed into an object.
    // If it's already an object (and not empty), we can skip express.json()
    if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
        return next();
    }

    // Fallback to express.json() for local development
    express.json()(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: "Invalid data (Malformed JSON payload)"
            });
        }
        next();
    });
});
enum Position {
    SeniorFrontendDeveloper = "Senior Frontend Developer",
    SeniorBackendDeveloper = "Senior Backend Developer",
    DevOpsEngineer = "DevOps Engineer",
    UXUIDesigner = "UX/UI Designer"
}
// Zod Schema สำหรับข้อมูลส่วนตัวผู้สมัคร
const personalInfoSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    gender: z.string().min(1, 'Gender is required'),
    dateOfBirth: z.string().regex(/^\d{2}-\d{2}-\d{4}$/, 'Invalid date format (e.g., 02-03-2026)'),
    age: z.number().int('Age must be an integer').min(0, 'Age must be a positive number'),
    email: z.string().email('Invalid email format'),
    position: z.enum(
        Object.values(Position) as [string, ...string[]],
        { error: 'Invalid position expected one of Senior Frontend Developer | Senior Backend Developer | DevOps Engineer | UX/UI Designer' }
    ),
    expectedSalary: z.number().min(0, 'Expected salary must be a positive number')
});

app.post('/api/submit', (req: Request, res: Response) => {
    try {
        // Validate request body
        const validatedData = personalInfoSchema.parse(req.body);

        // จำลองการ Response ว่าข้อมูลบันทึกสำเร็จ
        return res.status(200).json({
            success: true,
            message: "User created successfully",
            data: validatedData,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: "Invalid data (Validation Failed)",
                errors: error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ status: "OK", message: "API is up and running!" });
});

export default app;
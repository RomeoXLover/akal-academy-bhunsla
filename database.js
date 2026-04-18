const INITIAL_STATE = {
    settings: {
        language: "en"
    },
    users: [
        { id: "u1", username: "Test", password: "test", role: "Operator", name: "System Admin", roll: "N/A", admission: "000", class: "Administration", blood: "O+", phone: "+91 99999 88888", email: "admin@akalacademy.in", guardian: "", address: "Akal Academy Bhunsla Campus", status: "Active" },
        { id: "u2", username: "principal", password: "password123", role: "Principal", name: "Dr. Gurleen Kaur", roll: "N/A", admission: "P001", class: "School Head", blood: "A+", phone: "+91 98765 43210", email: "principal@akalacademy.in", guardian: "", address: "Bhunsla, Punjab", status: "Active" },
        { id: "u3", username: "teacher1", password: "password123", role: "Teacher", name: "S. Amandeep Singh", roll: "N/A", admission: "T101", class: "12th", subject: "Science", blood: "B+", phone: "+91 98123 45678", email: "amandeep@akalacademy.in", guardian: "", address: "Bhunsla Staff Quarters", status: "Active" },
        { id: "u5", username: "teacher2", password: "password123", role: "Teacher", name: "Ms. Kuldeep Kaur", roll: "N/A", admission: "T102", class: "12th", subject: "Maths", blood: "AB+", phone: "+91 97888 44110", email: "kuldeep@akalacademy.in", guardian: "", address: "Bhunsla Staff Quarters", status: "Active" },
        { id: "u7", username: "teacher3", password: "password123", role: "Teacher", name: "S. Gurpreet Singh", roll: "N/A", admission: "T103", class: "11th", subject: "English", blood: "O-", phone: "+91 98555 22110", email: "gurpreet@akalacademy.in", guardian: "", address: "Staff Villa 3", status: "Active" },
        { id: "u8", username: "teacher4", password: "password123", role: "Teacher", name: "Ms. Navneet Kaur", roll: "N/A", admission: "T104", class: "10th", subject: "Social Studies", blood: "B-", phone: "+91 98222 33445", email: "navneet@akalacademy.in", guardian: "", address: "Staff Villa 4", status: "Active" },
        { id: "u9", username: "teacher5", password: "password123", role: "Teacher", name: "S. Jagdeep Singh", roll: "N/A", admission: "T105", class: "9th", subject: "Punjabi", blood: "A+", phone: "+91 98777 66554", email: "jagdeep@akalacademy.in", guardian: "", address: "Staff Villa 5", status: "Active" },
        
        // Students for Class 12th
        { id: "u4", username: "student1", password: "password123", role: "Student", name: "Harman Singh", roll: "1", admission: "231", class: "12th", blood: "O+", phone: "+91 91234 56789", email: "harman.s@akalacademy.in", guardian: "S. Rajinder Singh", address: "Village Bhunsla", status: "Active" },
        { id: "u10", username: "student2", password: "password123", role: "Student", name: "Simran Kaur", roll: "2", admission: "232", class: "12th", blood: "A+", phone: "+91 91234 56790", email: "simran.k@akalacademy.in", guardian: "S. Balbir Singh", address: "Village Bhunsla", status: "Active" },
        { id: "u11", username: "student3", password: "password123", role: "Student", name: "Gurtej Singh", roll: "3", admission: "233", class: "12th", blood: "B+", phone: "+91 91234 56791", email: "gurtej.s@akalacademy.in", guardian: "S. Hardeep Singh", address: "Village Bhunsla", status: "Active" },
        { id: "u12", username: "student4", password: "password123", role: "Student", name: "Navjot Kaur", roll: "4", admission: "234", class: "12th", blood: "AB+", phone: "+91 91234 56792", email: "navjot.k@akalacademy.in", guardian: "S. Gurnam Singh", address: "Village Bhunsla", status: "Active" },
        { id: "u13", username: "student5", password: "password123", role: "Student", name: "Arshdeep Singh", roll: "5", admission: "235", class: "12th", blood: "O-", phone: "+91 91234 56793", email: "arshdeep.s@akalacademy.in", guardian: "S. Sukhdev Singh", address: "Village Bhunsla", status: "Active" },
        
        // Students for Class 8th
        { id: "u6", username: "student8", password: "password123", role: "Student", name: "Jaspreet Kaur", roll: "8", admission: "801", class: "8th", blood: "A-", phone: "+91 94555 11442", email: "jaspreet@akalacademy.in", guardian: "S. Mohinder Singh", address: "Bhunsla", status: "Active" },
        { id: "u14", username: "student9", password: "password123", role: "Student", name: "Manjot Singh", roll: "9", admission: "802", class: "8th", blood: "B-", phone: "+91 94555 11443", email: "manjot@akalacademy.in", guardian: "S. Pritam Singh", address: "Bhunsla", status: "Active" },
        { id: "u15", username: "student10", password: "password123", role: "Student", name: "Prabhjot Kaur", roll: "10", admission: "803", class: "8th", blood: "AB-", phone: "+91 94555 11444", email: "prabhjot@akalacademy.in", guardian: "S. Karam Singh", address: "Bhunsla", status: "Active" }
    ],
    tests: [
        // Tests for 12th Class
        { id: "t1", title: "Unit Test 1", subject: "Maths", className: "12th", date: "2026-04-21", minMarks: 0, maxMarks: 50, passMarks: 18, desc: "Algebra, matrices and determinants.", createdBy: "u5", scores: [] },
        { id: "t2", title: "Science Practical Review", subject: "Science", className: "12th", date: "2026-04-23", minMarks: 0, maxMarks: 40, passMarks: 16, desc: "Physics and chemistry practical notebook checking.", createdBy: "u3", scores: [] },
        { id: "t3", title: "English Weekly Quiz", subject: "English", className: "12th", date: "2026-04-12", minMarks: 0, maxMarks: 20, passMarks: 8, desc: "Reading comprehension and grammar.", createdBy: "u2", scores: [{ studentId: "u4", marks: 18 }, { studentId: "u10", marks: 19 }, { studentId: "u11", marks: 15 }] },
        { id: "t5", title: "Maths Chapter 5 Quiz", subject: "Maths", className: "12th", date: "2026-04-15", minMarks: 0, maxMarks: 30, passMarks: 12, desc: "Differentiation basics.", createdBy: "u5", scores: [{ studentId: "u4", marks: 28 }, { studentId: "u12", marks: 25 }] },
        { id: "t6", title: "Physics Unit 2 Test", subject: "Science", className: "12th", date: "2026-04-18", minMarks: 0, maxMarks: 50, passMarks: 18, desc: "Electrostatics and Current Electricity.", createdBy: "u3", scores: [{ studentId: "u4", marks: 45 }, { studentId: "u13", marks: 38 }] },
        
        // Tests for 8th Class
        { id: "t4", title: "Science Class Test", subject: "Science", className: "8th", date: "2026-04-11", minMarks: 0, maxMarks: 25, passMarks: 10, desc: "Chapter revision.", createdBy: "u3", scores: [{ studentId: "u6", marks: 22 }, { studentId: "u14", marks: 18 }] },
        { id: "t7", title: "Maths Monthly Test", subject: "Maths", className: "8th", date: "2026-04-14", minMarks: 0, maxMarks: 40, passMarks: 15, desc: "Rational numbers and Linear equations.", createdBy: "u5", scores: [{ studentId: "u6", marks: 35 }, { studentId: "u15", marks: 30 }] }
    ],
    homework: [
        { id: "h1", title: "Electrostatics Chart", subject: "Science", className: "12th", date: "2026-04-20", desc: "Prepare a chart on electrostatics and submit it in class.", createdBy: "u3", completed: false },
        { id: "h2", title: "Exercise 5.2", subject: "Maths", className: "12th", date: "2026-04-21", desc: "Solve exercise 5.2 and revise integration formulas.", createdBy: "u5", completed: false },
        { id: "h3", title: "Shabad Meaning", subject: "Divinity", className: "12th", date: "2026-04-12", desc: "Memorize the assigned shabad section and meaning.", createdBy: "u2", completed: true },
        { id: "h5", title: "Essay Writing", subject: "English", className: "12th", date: "2026-04-16", desc: "Write an essay on 'Impact of Technology on Education'.", createdBy: "u7", completed: false },
        
        { id: "h4", title: "Simple Machines", subject: "Science", className: "8th", date: "2026-04-10", desc: "Write short notes on simple machines.", createdBy: "u3", completed: true },
        { id: "h6", title: "Geometry Constructions", subject: "Maths", className: "8th", date: "2026-04-14", desc: "Complete the constructions from Chapter 4.", createdBy: "u5", completed: false }
    ],
    results: [
        // Results for Harman Singh (u4)
        { id: "r1", studentId: "u4", term: "Pre-mid", subject: "Maths", score: 85, max: 100, internal: 18, internalMax: 20 },
        { id: "r2", studentId: "u4", term: "Pre-mid", subject: "Science", score: 91, max: 100, internal: 19, internalMax: 20 },
        { id: "r3", studentId: "u4", term: "Pre-mid", subject: "English", score: 88, max: 100, internal: 17, internalMax: 20 },
        { id: "r4", studentId: "u4", term: "Mid-term", subject: "Punjabi", score: 79, max: 100, internal: 15, internalMax: 20 },
        { id: "r5", studentId: "u4", term: "Mid-term", subject: "Computer/IT", score: 93, max: 100, internal: 20, internalMax: 20 },
        { id: "r7", studentId: "u4", term: "Post-mid", subject: "Maths", score: 82, max: 100, internal: 18, internalMax: 20 },
        
        // Results for Simran Kaur (u10)
        { id: "r8", studentId: "u10", term: "Pre-mid", subject: "Maths", score: 92, max: 100, internal: 20, internalMax: 20 },
        { id: "r9", studentId: "u10", term: "Pre-mid", subject: "Science", score: 88, max: 100, internal: 18, internalMax: 20 },
        
        // Results for Jaspreet Kaur (u6)
        { id: "r6", studentId: "u6", term: "Pre-mid", subject: "Science", score: 82, max: 100, internal: 16, internalMax: 20 },
        { id: "r10", studentId: "u6", term: "Pre-mid", subject: "Maths", score: 75, max: 100, internal: 14, internalMax: 20 }
    ],
    syllabus: [
        { id: "s1", subject: "Maths", className: "12th", type: "text", content: "<p><strong>Calculus</strong></p><ul><li>Differentiation and applications</li><li>Integrals and area</li></ul>" },
        { id: "s2", subject: "Science", className: "12th", type: "text", content: "<p><strong>Physics and Chemistry</strong></p><ul><li>Electrostatics</li><li>Organic compounds</li></ul>" },
        { id: "s3", subject: "SST", className: "8th", type: "text", content: "<p><strong>Social Studies</strong></p><ul><li>Resources</li><li>Civics basics</li></ul>" },
        { id: "s4", subject: "Divinity", className: "12th", type: "file", content: "", fileName: "divinity-guide.txt", fileData: "data:text/plain;base64,U2VsZWN0ZWQgYmFuaSBwYXRoCk1lYW5pbmcgYW5kIHJlZmxlY3Rpb24=" },
        { id: "s5", subject: "English", className: "12th", type: "text", content: "<p><strong>Writing and Literature</strong></p><ul><li>Reading comprehension</li><li>Writing practice</li></ul>" },
        { id: "s6", subject: "Punjabi", className: "12th", type: "text", content: "<p><strong>Punjabi Grammar</strong></p><ul><li>Grammar revision</li><li>Literature notes</li></ul>" },
        { id: "s7", subject: "Hindi", className: "12th", type: "text", content: "<p><strong>Hindi Vyakaran</strong></p><ul><li>Path and summary</li><li>Grammar exercises</li></ul>" },
        { id: "s8", subject: "Computer/IT", className: "12th", type: "text", content: "<p><strong>Computer and IT</strong></p><ul><li>Database basics</li><li>Networking and office tools</li></ul>" },
        { id: "s9", subject: "Science", className: "8th", type: "text", content: "<p><strong>Physics and Chemistry</strong></p><ul><li>Simple Machines</li><li>Chemical changes</li></ul>" }
    ],
    timetable: {
        headerLabel: "Period / Time",
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        periods: [
            { label: "8:00 - 8:45", cells: ["Maths", "Science", "English", "Punjabi", "Computer/IT", "Divinity"] },
            { label: "8:50 - 9:35", cells: ["Science", "Maths", "Divinity", "Hindi", "SST", "English"] },
            { label: "9:40 - 10:25", cells: ["English", "Computer/IT", "Maths", "Science", "Divinity", "Maths"] },
            { label: "10:25 - 10:45", cells: ["BREAK", "BREAK", "BREAK", "BREAK", "BREAK", "BREAK"] },
            { label: "10:45 - 11:30", cells: ["Punjabi", "SST", "Science", "Maths", "English", "Punjabi"] },
            { label: "11:35 - 12:20", cells: ["Library", "Game", "Music", "Art", "SST", "Science"] }
        ]
    },
    examTypes: ["Pre-mid", "Mid-term", "Post-mid", "Final-exam"],
    notifications: []
};


if (typeof window !== "undefined") {
    window.INITIAL_STATE = INITIAL_STATE;
}

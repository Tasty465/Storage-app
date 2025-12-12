const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session Setup
app.use(
    session({
        secret: "super_secret_key", 
        resave: false,
        saveUninitialized: false,
        cookie: { 
            secure: app.get('env') === 'production',
            httpOnly: true 
        }
    })
);

// Middleware to expose session user to all EJS templates
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Views Configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


const authController = require("./controllers/authController"); 
// Requires the adminController for storage logic
const admin = require("./controllers/adminController"); 
const adminController = require("./controllers/adminController");


app.get("/", (req, res) => {
    if (req.session.user) {
        return req.session.user.role === "admin" 
            ? res.redirect("/admin/dashboard") 
            : res.redirect("/customer/dashboard");
    }
    res.render("login");
});

// AUTH ROUTES
// GET: Show Login Form
app.get("/login", authController.showLogin);
// POST: Handle Login Submission
app.post("/login", authController.login);

// GET: Show Register Form
app.get("/register", authController.showRegister);
// POST: Handle Registration Submission
app.post("/register", authController.register);

// GET: Logout and destroy session
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.locals.user = null; 
        res.redirect("/login");
    });
});

// CUSTOMER DASHBOARD
app.get("/customer/dashboard", (req, res) => {
    if (!req.session.user) return res.redirect("/login");
    res.render("customer_dashboard");
});

// ADMIN DASHBOARD (The main storage list view)
app.get("/admin/dashboard", (req, res) => {
    if (!req.session.user) return res.redirect("/login");
    if (req.session.user.role !== "admin") return res.status(403).send("Not authorized");
    
    // Calls the controller function to fetch and display the storage list
    admin.showStorageList(req, res);
});


// ADD STORAGE
// GET: Show Add Form
app.get("/admin/storage/add", adminController.showAddForm);
// POST: Handle Add Submission
app.post("/admin/storage/add", adminController.addStorage);

// EDIT STORAGE
// GET: Show Edit Form (e.g., /admin/storage/edit/1)
app.get("/admin/storage/edit/:id", adminController.showEditForm);
// POST: Handle Edit Submission
app.post("/admin/storage/edit/:id", adminController.updateStorage);

// DELETE STORAGE
// GET: Handle Deletion (e.g., /admin/storage/delete/1)
app.get("/admin/storage/delete/:id", adminController.deleteStorage);

// Fallback GET /admin/storage (If the dashboard route is changed)
app.get("/admin/storage", adminController.showStorageList);


// Start Server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

// Catch server errors (e.g., port already in use)
server.on('error', (err) => {
    console.error('Express server error:', err && err.message ? err.message : err);
    // Optional: exit to let process manager restart the app
    // process.exit(1);
});

// Global handlers to catch unexpected/unhandled errors
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err && err.message ? err.message : err);
    // Recommended: flush logs and exit or attempt a graceful shutdown
    // process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Recommended: flush logs and exit or attempt a graceful shutdown
    // process.exit(1);
});
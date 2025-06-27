const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const session = require("express-session");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// CORS configuration - ĐẶT TRƯỚC TẤT CẢ MIDDLEWARE KHÁC
const corsOptions = {
  origin: function (origin, callback) {
    // Danh sách các origin được phép truy cập
    const allowedOrigins = [
      "http://localhost:8081",
      "http://localhost:3000",
      "http://localhost:19006", // Expo dev server
      "http://10.87.18.160:8081",
      "http://10.87.18.160:19000",
      "http://10.87.18.160:19006",
      "http://127.0.0.1:8081",
      "exp://10.87.18.160:8081", // Expo URL format
      "exp://localhost:8081",
    ];

    // Cho phép requests không có origin (mobile apps, Postman, curl)
    if (!origin) {
      console.log("Request without origin allowed");
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      console.log("Origin allowed:", origin);
      callback(null, true);
    } else {
      console.log("Origin blocked by CORS:", origin);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Cache-Control",
    "X-Access-Token",
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Origin",
    "Access-Control-Allow-Methods",
  ],
  credentials: true, // Cho phép cookies và credentials
  optionsSuccessStatus: 200, // Legacy browser support
  maxAge: 86400, // 24 hours cache for preflight
};

// Áp dụng CORS cho tất cả routes
app.use(cors(corsOptions));

// Middleware bổ sung để đảm bảo CORS headers luôn có
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Log request info để debug
  console.log(
    `${req.method} ${req.path} from origin: ${origin || "no-origin"}`
  );

  // Set CORS headers manually để đảm bảo
  if (origin) {
    const allowedOrigins = [
      "http://localhost:8081",
      "http://localhost:3000",
      "http://localhost:19006",
      "http://192.168.100.190:8081",
      "http://10.87.18.160:19000",
      "http://10.87.18.160:19006",
      "http://127.0.0.1:8081",
      "exp://192.168.100.190:8081",
      "exp://localhost:8081",
    ];

    if (allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
  } else {
    // Cho phép requests không có origin
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-Access-Token"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400");

  // Xử lý preflight requests (OPTIONS)
  if (req.method === "OPTIONS") {
    console.log("Preflight request handled");
    return res.status(200).end();
  }

  next();
});

// Session middleware - SAU khi đã setup CORS
app.use(
  session({
    secret:
      process.env.SESSION_SECRET || "fallback_secret_key_change_in_production",
    resave: false,
    saveUninitialized: false, // Changed to false for better security
    cookie: {
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      httpOnly: true, // Prevent XSS attacks
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // For cross-origin
    },
  })
);

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Standard middleware
app.use(logger("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Routes
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const authRouter = require("./routes/auth.routes");
const chatRoutes = require("./routes/textChat.routes");
const textImageRoutes = require("./routes/textImage.routes");

// Mount routes
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/auth", authRouter); // Routes: /auth/register, /auth/login, etc.
app.use("/chatbotAI", chatRoutes); // Routes: /chat/history, /chat/send
app.use("/chatbotAI", textImageRoutes);

// Health check endpoint để test CORS
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    cors: "enabled",
    origin: req.headers.origin || "no-origin",
  });
});

// CORS test endpoint
app.get("/cors-test", (req, res) => {
  res.json({
    message: "CORS is working!",
    origin: req.headers.origin,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Handle CORS errors specifically
  if (err.message && err.message.includes("not allowed by CORS")) {
    console.error("CORS Error:", err.message);
    return res.status(403).json({
      error: "CORS Policy Violation",
      message: err.message,
      origin: req.headers.origin,
      allowedOrigins: [
        "http://localhost:8081",
        "http://10.87.18.160:8081",
        "http://10.87.18.160:19000",
      ],
    });
  }

  // Handle other errors
  const status = err.status || 500;

  // API requests (JSON response)
  if (req.xhr || req.headers.accept?.includes("application/json")) {
    return res.status(status).json({
      error: status === 500 ? "Internal Server Error" : err.message,
      status: status,
    });
  }

  // Web requests (render error page)
  res.status(status);
  res.render("error");
});

module.exports = app;

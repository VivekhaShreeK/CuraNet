import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
//import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import env from "dotenv";
import methodOverride from "method-override";

const app = express();
const port = 3005;
const saltRounds = 10;
env.config();

// Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(methodOverride("_method"));

app.use(passport.initialize());
app.use(passport.session());

// PostgreSQL Configuration
const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

// Route Handlers
app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("home.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/open", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("open.ejs");
  } else {
    res.redirect("/login");
  }
});

// Logout Route
app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

// Google OAuth Routes
// app.get(
//   "/auth/google",
//   passport.authenticate("google", {
//     scope: ["profile", "email"],
//   })
// );

app.get(
  "/auth/google/secrets",
  passport.authenticate("google", {
    successRedirect: "/open",
    failureRedirect: "/login",
  })
);

app.get("/community", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT post_id, title FROM BlogPosts ORDER BY created_at DESC"
    );
    res.render("community.ejs", { posts: result.rows });
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).send("Error loading posts.");
  }
});

app.get("/post/:id", async (req, res) => {
  const postId = req.params.id;
  try {
    const result = await db.query("SELECT * FROM BlogPosts WHERE post_id = $1", [
      postId,
    ]);
    if (result.rows.length > 0) {
      res.render("post.ejs", { post: result.rows[0] });
    } else {
      res.status(404).send("Post not found.");
    }
  } catch (err) {
    console.error("Error fetching post:", err);
    res.status(500).send("Error loading post.");
  }
});

app.get("/create", (req, res) => {
    res.render("create.ejs");
});

app.get("/tracker", (req, res) => {
  res.render("tracker.ejs");
});

// Registration Route
app.post("/register", async (req, res) => {
  const { userid, phone, username: email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.json({
      success: false,
      message: "Passwords do not match. Please try again.",
      class: "alert alert-danger",
    });
  }

  try {
    const checkResult = await db.query("SELECT * FROM regis WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      return res.json({
        success: false,
        message: "Email already registered. Please log in.",
        class: "alert alert-warning",
        redirectUrl: "/login",
      });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert with created_at handled by PostgreSQL
    await db.query(
      "INSERT INTO regis (userid, phone, email, password) VALUES ($1, $2, $3, $4)",
      [userid, phone, email, hashedPassword]
    );

    res.json({
      success: true,
      message: "Registration successful! Redirecting...",
      class: "alert alert-success",
      redirectUrl: "/login",
    });
  } catch (err) {
    console.error("Error occurred:", err);
    res.json({
      success: false,
      message: "An error occurred. Please try again.",
      class: "alert alert-danger",
    });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { username: email, password } = req.body;

  try {
    const result = await db.query("SELECT * FROM regis WHERE email = $1", [
      email,
    ]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedPassword = user.password;
      const passwordMatch = await bcrypt.compare(password, storedPassword);

      if (passwordMatch) {
        req.login(user, (err) => {
          if (err) {
            console.error("Login Error:", err);
            return res.json({
              success: false,
              message: "Login error. Please try again.",
              class: "alert alert-danger",
            });
          }
          return res.json({
            success: true,
            message: "Login successful! Redirecting...",
            class: "alert alert-success",
            redirectUrl: "/open",
          });
        });
      } else {
        return res.json({
          success: false,
          message: "Incorrect password. Please try again.",
          class: "alert alert-danger",
        });
      }
    } else {
      return res.json({
        success: false,
        message: "User not found. Please register.",
        class: "alert alert-warning",
      });
    }
  } catch (err) {
    console.error("Error occurred during login:", err);
    res.json({
      success: false,
      message: "An error occurred. Please try again.",
      class: "alert alert-danger",
    });
  }
});

// Local Strategy for Passport
passport.use(
  "local",
  new Strategy(async function verify(username, password, cb) {
    try {
      const result = await db.query("SELECT * FROM regis WHERE email = $1", [
        username,
      ]);

      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;

        bcrypt.compare(password, storedHashedPassword, (err, valid) => {
          if (err) {
            console.error("Error comparing passwords:", err);
            return cb(err);
          }
          if (valid) {
            return cb(null, user);
          } else {
            return cb(null, false, { message: "Incorrect password." });
          }
        });
      } else {
        return cb(null, false, { message: "User not found." });
      }
    } catch (err) {
      console.error("Error verifying user:", err);
      return cb(err);
    }
  })
);

// Google OAuth Strategy
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "ur url",
//     },
//     async (accessToken, refreshToken, profile, cb) => {
//       try {
//         console.log("Google Profile:", profile);

//         // Correctly retrieve email
//         const email = profile.emails[0].value;

//         const result = await db.query("SELECT * FROM regis WHERE email = $1", [
//           email,
//         ]);

//         if (result.rows.length === 0) {
//           // Insert new Google user with default values for userid and phone
//           const newUser = await db.query(
//             "INSERT INTO regis (userid, phone, email, password) VALUES ($1, $2, $3, $4) RETURNING *",
//             ["google_user", "0000000000", email, "google"]
//           );
//           return cb(null, newUser.rows[0]);
//         } else {
//           // Return existing user
//           return cb(null, result.rows[0]);
//         }
//       } catch (err) {
//         console.error("Google Strategy Error:", err);
//         return cb(err);
//       }
//     }
//   )
// );

// Serialize and Deserialize User
passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
  try {
    const result = await db.query("SELECT * FROM regis WHERE id = $1", [id]);
    if (result.rows.length > 0) {
      cb(null, result.rows[0]);
    } else {
      cb("User not found.");
    }
  } catch (err) {
    cb(err);
  }
});

// Start the Server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});

app.post("/create", async (req, res) => {
  const { title, content } = req.body;
  try {
    await db.query(
      "INSERT INTO BlogPosts (title, content) VALUES ($1, $2)",
      [title, content]
    );
    res.redirect("/community");
  } catch (err) {
    console.error("Error adding post:", err);
    res.status(500).send("Error creating post.");
  }
});

app.delete("/delete/:id", async (req, res) => {
  const postId = req.params.id;
  try {
    await db.query("DELETE FROM BlogPosts WHERE post_id = $1", [postId]);
    res.redirect("/community");
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).send("Error deleting post.");
  }
});

//locator
app.get("/locator", (req, res) => {
  res.render("locator.ejs");
});

//tracker
app.get("/tracker", (req, res) => {
  res.render("tracker.ejs");
});





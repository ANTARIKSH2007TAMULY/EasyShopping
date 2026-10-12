## Key Concepts and Explanations

This document explains important security and web concepts used in this project.

1) bcrypt and salt
- bcrypt is a password-hashing algorithm. When hashing a password it uses a
  per-password random value called a "salt". The salt is stored as part of the
  resulting hash. The main benefits:
  - Prevents use of rainbow tables (precomputed hash lists).
  - Ensures identical passwords hash differently.
  - Designed to be slow to resist brute-force attacks.

2) REST APIs
- REST (Representational State Transfer) is an architectural style for building
  web services. Typical properties used here:
  - Resources are identified by paths (e.g. `/customers`).
  - Use of HTTP verbs: `GET` to read data, `POST` to create or trigger actions.
  - Stateless communication: each request contains all information needed.

3) JWT (JSON Web Tokens)
- JWTs are compact tokens that carry claims and are signed by the server.
  - Here they carry the user id and are signed with `JWT_SECRET`.
  - The backend issues a token after successful login, and the token expires
    (1 day by default).

4) Cookies and `httpOnly`
- Storing JWT in an `httpOnly` cookie means browser JS cannot read the token,
  which protects against some XSS attacks. The cookie is automatically sent with
  cross-origin requests when `withCredentials: true` is set on the client.

5) CORS (Cross-Origin Resource Sharing)
- During development the frontend and backend run on different origins. CORS is
  configured on the backend to allow requests from the frontend origin and to
  include credentials (cookies).

6) Why we hash passwords instead of encrypting them
- Hashing is one-way: even the server cannot retrieve the original password from
  the hash. This reduces risk if the database is leaked.

7) Secure deployment notes (brief)
- Always run over HTTPS in production so cookies and credentials are protected.
- Use a strong, secret `JWT_SECRET` and rotate it if needed.
- Consider additional protections like refresh tokens, CSRF protection, rate
  limiting, and account lockouts for repeated failed logins.

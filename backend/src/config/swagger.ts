import swaggerJsdoc from "swagger-jsdoc";

const version = "1.0.0";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "C2D Tech (Concept to Deploy) — API",
      description: "Enterprise REST API powering the C2D Tech website, CMS, Admin Dashboard, and Lead Management CRM.\n\nAuth: obtain a JWT via `POST /api/v1/auth/login` (or `POST /api/v1/auth/refresh`) and send it as `Authorization: Bearer <token>`. Refresh tokens are stored in an httpOnly cookie.",
      version,
      contact: { name: "C2D Tech — Developer Friends Squad", email: "concept2deploytech@gmail.com" },
      license: { name: "Proprietary" },
    },
    servers: [
      { url: "http://localhost:5000", description: "Local development" },
      { url: "https://api.c2dtech.example.com", description: "Production" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
      schemas: {
        ApiEnvelope: { type: "object", properties: { success: { type: "boolean" }, data: {}, meta: { type: "object" } } },
        Error: {
          type: "object",
          properties: { success: { type: "boolean", example: false }, error: { type: "object", properties: { code: { type: "string" }, message: { type: "string" }, details: {} } } },
        },
        Service: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" }, slug: { type: "string" }, tagline: { type: "string" },
            shortDescription: { type: "string" }, description: { type: "string" },
            features: { type: "array", items: { type: "string" } },
            deliverables: { type: "array", items: { type: "string" } },
            pricing: { type: "object", properties: { enabled: { type: "boolean" }, startingAt: { type: "number" }, currency: { type: "string" }, deliveryDays: { type: "number" } } },
            published: { type: "boolean" }, order: { type: "number" },
          },
        },
        PortfolioProject: {
          type: "object",
          properties: {
            _id: { type: "string" }, title: { type: "string" }, slug: { type: "string" },
            shortDescription: { type: "string" }, description: { type: "string" },
            coverImage: { type: "string" }, gallery: { type: "array", items: { type: "string" } },
            technologies: { type: "array", items: { type: "string" } }, category: { type: "string" },
            client: { type: "string" }, year: { type: "string" }, liveUrl: { type: "string" }, githubUrl: { type: "string" },
            featured: { type: "boolean" }, status: { type: "string" },
          },
        },
        Blog: {
          type: "object",
          properties: {
            _id: { type: "string" }, title: { type: "string" }, slug: { type: "string" },
            excerpt: { type: "string" }, content: { type: "string" }, coverImage: { type: "string" },
            category: { type: "string" }, tags: { type: "array", items: { type: "string" } },
            status: { type: "string", enum: ["draft", "published", "scheduled"] },
            featured: { type: "boolean" }, views: { type: "number" }, publishedAt: { type: "string", format: "date-time" },
          },
        },
        Job: {
          type: "object",
          properties: {
            _id: { type: "string" }, title: { type: "string" }, slug: { type: "string" }, department: { type: "string" },
            location: { type: "string" }, type: { type: "string" }, experience: { type: "string" }, salary: { type: "string" },
            description: { type: "string" }, responsibilities: { type: "array", items: { type: "string" } },
            requirements: { type: "array", items: { type: "string" } }, status: { type: "string", enum: ["draft", "open", "closed"] },
          },
        },
        Lead: {
          type: "object",
          properties: {
            _id: { type: "string" }, leadId: { type: "string", example: "LD-0001" }, name: { type: "string" },
            company: { type: "string" }, email: { type: "string" }, phone: { type: "string" }, whatsapp: { type: "string" },
            city: { type: "string" }, state: { type: "string" }, country: { type: "string" }, businessType: { type: "string" },
            service: { type: "string" }, budget: { type: "string" }, priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
            source: { type: "string" }, status: { type: "string" }, assignedTo: { type: "string" },
            expectedClosingDate: { type: "string", format: "date-time" }, followUpDate: { type: "string", format: "date-time" },
            tags: { type: "array", items: { type: "string" } },
          },
        },
        LeadNote: { type: "object", properties: { _id: { type: "string" }, lead: { type: "string" }, body: { type: "string" }, byName: { type: "string" } } },
        Notification: { type: "object", properties: { _id: { type: "string" }, type: { type: "string" }, title: { type: "string" }, message: { type: "string" }, read: { type: "boolean" } } },
        Role: { type: "object", properties: { _id: { type: "string" }, name: { type: "string" }, label: { type: "string" }, level: { type: "number" }, permissions: { type: "array", items: { type: "string" } } } },
        ContactMessage: { type: "object", properties: { _id: { type: "string" }, name: { type: "string" }, email: { type: "string" }, phone: { type: "string" }, service: { type: "string" }, budget: { type: "string" }, timeline: { type: "string" }, message: { type: "string" }, status: { type: "string" } } },
        ProjectEstimate: { type: "object", properties: { _id: { type: "string" }, name: { type: "string" }, email: { type: "string" }, serviceNames: { type: "array", items: { type: "string" } }, totalCost: { type: "number" }, currency: { type: "string" }, timeline: { type: "string" }, status: { type: "string" } } },
        Paginated: { type: "object", properties: { data: { type: "array" }, meta: { type: "object", properties: { page: { type: "number" }, limit: { type: "number" }, total: { type: "number" }, pages: { type: "number" } } } } },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: "Public", description: "Read-only content endpoints for the public website" },
      { name: "Contact", description: "Public enquiry form" },
      { name: "Newsletter", description: "Public newsletter subscription" },
      { name: "Estimator", description: "Project estimator quotes & submissions" },
      { name: "Analytics", description: "Site visit tracking & analytics" },
      { name: "Auth", description: "Authentication, 2FA, password & user management" },
      { name: "Admin", description: "Admin dashboard, CMS, CRM & settings" },
      { name: "Media", description: "Media library uploads" },
      { name: "Export", description: "CSV / Excel / PDF exports" },
    ],
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);

export const swaggerUiOptions = {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "C2D Tech API Docs",
};

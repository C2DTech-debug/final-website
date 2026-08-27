import type { AgreementTemplate } from "@/types";

export const AGREEMENT_TEMPLATES: AgreementTemplate[] = [
  {
    id: "c2d-master",
    name: "C2D Tech Master Service Agreement (Official Full Template)",
    description: "Official 24-section Master Service & Project Development Agreement for C2D Tech engagements.",
    title: "MASTER SERVICE AGREEMENT / PROJECT DEVELOPMENT AGREEMENT",
    scope:
      "Website, web application or software design and development, UI/UX design, responsive front-end, full-stack architecture, admin dashboards, e-commerce functionality, database integration, backend APIs, payment gateways, WhatsApp/messaging integrations, user/admin authentication, deployment, testing and bug fixing within agreed scope.",
    defaultAdvancePercentage: 40,
    body: `<h3>3. SCOPE OF SERVICES</h3>
<p>Depending on the nature of the specific project, the services under this Agreement may include one or more of the following, as agreed in the applicable proposal, quotation or scope document:</p>
<ul>
  <li>Website, web application or software design and development.</li>
  <li>UI/UX design and responsive front-end development.</li>
  <li>Full-stack development, including front-end and back-end components.</li>
  <li>Admin dashboards and management/reporting interfaces.</li>
  <li>E-commerce functionality, including product, cart, order and inventory features where agreed.</li>
  <li>Database design, development and integration.</li>
  <li>Backend, API and third-party integrations.</li>
  <li>Payment gateway integration.</li>
  <li>WhatsApp / messaging / notification API integrations.</li>
  <li>User and admin authentication and access control.</li>
  <li>Deployment of the completed system to agreed hosting.</li>
  <li>Testing and bug fixing within the agreed scope.</li>
  <li>Website maintenance and technical support, where separately agreed.</li>
  <li>Any other development, design or technical services expressly agreed in writing.</li>
</ul>

<h3>4. PROJECT SCOPE AND DELIVERABLES</h3>
<p>The exact scope, features, modules and deliverables for the Project are determined by the approved proposal, quotation, scope document, or other written project confirmation exchanged between the Parties ("Scope Document"). This Agreement governs the general commercial and legal terms applicable to the Project; the Scope Document governs the specific technical scope.</p>
<p>Any feature, module, integration or deliverable that is not expressly included in the Scope Document is not part of the Project and will be treated as additional work under Section 5 (Exclusions / Out-of-Scope Work) and Section 9 (Revisions and Change Requests).</p>

<h3>5. EXCLUSIONS / OUT-OF-SCOPE WORK</h3>
<p>Unless expressly included in the Scope Document, the following are excluded from the Project and will be treated as additional work requiring a separate quotation and written approval:</p>
<ul>
  <li>New features or modules not included in the agreed scope.</li>
  <li>Major redesigns or replacement of previously approved design/functionality.</li>
  <li>Additional pages, screens, dashboards or reports.</li>
  <li>Additional integrations with third-party platforms or services.</li>
  <li>Bulk data entry, data migration or data cleanup beyond what is specifically agreed.</li>
  <li>Content creation, copywriting, photography or graphic design beyond what is specifically agreed.</li>
  <li>SEO, digital marketing, advertising or social-media management, unless specifically included.</li>
  <li>Third-party subscription, licensing, API or service charges.</li>
  <li>Hosting, domain registration and renewal costs.</li>
  <li>Future changes required because a third-party provider changes its API, pricing, policies or technical requirements.</li>
</ul>
<p>Additional work will be quoted separately and will only commence after the Client approves the additional cost and any resulting change to the timeline, in writing.</p>

<h3>7. PROJECT TIMELINE AND DELIVERY</h3>
<p>The estimated timeline runs from receipt of the advance payment and all Client materials, information, approvals and third-party access credentials required to begin development. The timeline is an estimate and may reasonably be extended where delay is caused by:</p>
<ul>
  <li>Late provision of content, information, credentials, approvals or feedback by the Client.</li>
  <li>Delays caused by third-party services, platforms or providers.</li>
  <li>Delays in review, testing or approval by the Client.</li>
  <li>Additional work or scope changes agreed after the Project has commenced.</li>
  <li>Circumstances outside C2D Tech's reasonable control (see Force Majeure).</li>
</ul>

<h3>8. CLIENT RESPONSIBILITIES</h3>
<p>The Client agrees to:</p>
<ul>
  <li>Provide accurate, complete and timely information required for the Project.</li>
  <li>Provide content, logos, images, text and other materials required for the Project.</li>
  <li>Provide access and credentials for Client-owned hosting, domain, payment gateway, WhatsApp/API and other third-party services where required.</li>
  <li>Review demonstrations, deliverables and milestones, and provide consolidated feedback and approvals in a timely manner.</li>
  <li>Ensure that any data, content or information supplied to C2D Tech may lawfully be used for development, testing and deployment purposes.</li>
  <li>Maintain secure administrator credentials, access control and appropriate backups of business data after handover.</li>
</ul>

<h3>9. REVISIONS AND CHANGE REQUESTS</h3>
<p>Reasonable revisions to the agreed design or functionality are included where they remain within the original Scope Document. A "reasonable revision" does not include a new feature, a complete redesign, a replacement of previously approved functionality, or a material scope change.</p>
<p>Any scope change, new feature, or additional requirement requested after approval of the Scope Document may involve additional charges and an extension of the delivery timeline. No additional work will be treated as approved, and no work on it will commence, without written confirmation from the Client (including confirmation by email or WhatsApp).</p>

<h3>10. TESTING, REVIEW AND ACCEPTANCE</h3>
<p>Where applicable, C2D Tech will provide a demo or test version of the Project for the Client's review. The Client shall review the deliverable and report any material issues relating to the agreed scope within a reasonable time.</p>
<p>The Project will be considered accepted once the Client approves it, requests production deployment, or uses the completed system in production without raising a material scope-related objection — subject to correction of genuine bugs identified within the agreed support period.</p>

<h3>11. DATA, CONTENT AND SECURITY</h3>
<p>The Project may involve the processing of business, customer, user or other data supplied by the Client. The Client is responsible for ensuring that any data or content provided to C2D Tech is accurate and that the Client has the necessary rights and permissions to have it processed as part of the Project.</p>
<p>C2D Tech will take reasonable technical measures appropriate to the nature of the Project to help protect the system. However, no internet-connected system can be guaranteed to be completely free from vulnerabilities, unauthorized access, or third-party outages. After handover, the Client is responsible for secure passwords, access control, authorized users, and maintaining appropriate backups of business data, unless ongoing management is separately agreed with C2D Tech.</p>

<h3>12. THIRD-PARTY SERVICES AND INTEGRATIONS</h3>
<p>Where the Project involves payment gateways, WhatsApp or other messaging APIs, email/SMS providers, hosting providers, cloud services, plugins, external software or other third-party platforms, the relevant provider's terms, limits, fees and availability will apply.</p>
<p>C2D Tech is not responsible for failures, delays, account restrictions, policy changes, outages, or API or pricing changes caused by third-party providers, unless expressly agreed otherwise in writing. Third-party service fees are payable by the Client unless specifically included in the applicable Scope Document.</p>

<h3>13. DOMAIN, HOSTING AND DEPLOYMENT</h3>
<p>Where possible, domain and hosting accounts should be registered in the Client's name or otherwise controlled by the Client. Where C2D Tech manages deployment or hosting on the Client's behalf, the applicable access, cost and renewal arrangements will be agreed separately.</p>
<p>Production deployment is subject to receipt of the agreed payment(s) due at that stage and the availability of the required hosting, domain and third-party service access.</p>

<h3>14. INTELLECTUAL PROPERTY AND SOURCE CODE</h3>
<p>After the Client has paid the Total Project Fee and all other amounts due under this Agreement, the Client will receive the agreed final Project deliverables and, where source-code handover forms part of the agreed Scope Document, the applicable source code.</p>
<p>Third-party libraries, frameworks, APIs, plugins, fonts, templates and other licensed components used in the Project remain subject to their respective licenses, and the Client's rights to use them are as permitted under those licenses.</p>
<p>C2D Tech retains all rights to its pre-existing reusable code, tools, libraries, components, frameworks, development methods and general know-how that are not uniquely created for the Client, even where such items are used within the Project. Materials provided by the Client (such as logos, content, images and business data) remain the property of the Client.</p>
<p><strong>No rights in the final deliverables, including source code, transfer to the Client until the Total Project Fee and all other amounts due have been paid in full.</strong></p>

<h3>17. FINAL PAYMENT AND HANDOVER</h3>
<p>The final payment must be received before final production handover, source-code transfer (where applicable), and transfer of final administrative and deployment credentials, unless the Parties agree otherwise in writing. After receipt of the final payment, C2D Tech will complete the agreed handover items under the arrangement agreed for the Project.</p>

<h3>18. CONFIDENTIALITY</h3>
<p>Each Party agrees to keep confidential the other Party's non-public business, technical, financial, customer and project information received in connection with this Agreement, and to use such information only for purposes related to the Project — except where disclosure is required by law or authorized in writing by the disclosing Party. This obligation survives completion or termination of this Agreement.</p>

<h3>19. PORTFOLIO / SHOWCASE RIGHTS</h3>
<p>Unless the Client requests confidentiality in writing, C2D Tech may display the completed Project (including screenshots, descriptions and links) in its portfolio, website, social media and other promotional materials, without disclosing confidential business data, credentials or non-public information belonging to the Client. If the Client requires the Project to remain private, the Parties will confirm this in writing, and C2D Tech will not showcase the Project.</p>

<h3>20. WARRANTIES AND LIMITATION OF LIABILITY</h3>
<p>C2D Tech will perform the services under this Agreement with reasonable care and skill, in line with generally accepted industry practice. C2D Tech does not guarantee that the Project will be completely free from errors or vulnerabilities, or that any internet-connected system will be completely immune from unauthorized access, outages, or third-party failures.</p>
<p>C2D Tech is not liable for losses arising from Client misuse of the system, unauthorized access resulting from the Client's failure to maintain secure credentials, third-party service failures, or circumstances of force majeure. To the maximum extent permitted by applicable law, C2D Tech's total liability under this Agreement is limited to the Total Project Fee actually paid by the Client for the relevant Project.</p>

<h3>23. HOW THIS AGREEMENT APPLIES TO EACH PROJECT</h3>
<p>This Agreement is intended to serve as a standing master agreement between C2D Tech and the Client. For each new Project, the Parties will confirm the project-specific details (scope, fees, timeline, support period and any other variable terms) through a Scope Document, quotation, proposal, or other written confirmation. Once accepted, that Scope Document is deemed incorporated into and governed by the terms of this Agreement, unless the Parties expressly agree otherwise in writing for that Project.</p>`,
    terms: `<h3>21. DISPUTE RESOLUTION</h3>
<p>The Parties will first attempt to resolve any dispute arising out of or in connection with this Agreement through good-faith discussion. If a dispute cannot be resolved through discussion within a reasonable time, either Party may pursue the remedies available under applicable law.</p>
<p><strong>Governing Law:</strong> Laws of Tamil Nadu, India<br />
<strong>Jurisdiction:</strong> Courts of Trichy, Tamil Nadu, India</p>

<h3>22. GENERAL TERMS</h3>
<ul>
  <li><strong>Amendment:</strong> Any amendment to this Agreement or an applicable Scope Document must be confirmed in writing by both Parties.</li>
  <li><strong>Digital Execution:</strong> Digital signatures, cryptographic certificates, or written electronic confirmation may be used as evidence of acceptance of this Agreement or of a Scope Document, subject to applicable law.</li>
  <li><strong>Severability:</strong> If any provision of this Agreement is found unenforceable, the remaining provisions will continue to apply to the extent permitted by law.</li>
  <li><strong>Entire Agreement:</strong> This Agreement, together with the applicable Scope Document(s), constitutes the entire agreement between the Parties for the relevant Project and supersedes prior discussions on that subject, unless expressly stated otherwise in writing.</li>
  <li><strong>Notices:</strong> Communications relating to this Agreement may be sent to the phone numbers or email addresses stated in Section 1 (Parties), unless updated in writing.</li>
  <li><strong>Force Majeure:</strong> Neither Party is liable for delay or failure to perform caused by circumstances reasonably beyond its control, including natural disasters, internet or infrastructure outages, government action, or third-party service failures.</li>
  <li><strong>Survival:</strong> Sections relating to Intellectual Property and Source Code, Confidentiality, Limitation of Liability, and Dispute Resolution survive completion, expiry or termination of this Agreement.</li>
  <li><strong>Relationship of Parties:</strong> C2D Tech acts as an independent service provider and not as an employee, agent or partner of the Client.</li>
</ul>`,
    cancellation: `<h3>16. CANCELLATION AND REFUND POLICY</h3>
<p>The advance payment is intended to reserve development capacity and cover project planning, setup and early development work. Once Project work has commenced, the advance payment is generally non-refundable.</p>
<p>If the Client cancels the Project after development has commenced, the Client remains responsible for payment for work completed and any approved, non-cancellable third-party costs already incurred. Any refund, where applicable, will be calculated based on the work completed and amounts already incurred at the time of cancellation.</p>
<p>If C2D Tech is unable to continue the Project for reasons within its control, the Parties will discuss a fair settlement based on the work completed and amounts already received.</p>`,
    support: `<h3>15. MAINTENANCE AND SUPPORT</h3>
<p>During the included support period (30 days from production deployment unless otherwise stated in the Scope Document), C2D Tech will address genuine bugs in the agreed functionality — that is, defects where the delivered system does not perform as specified in the Scope Document.</p>
<p>The following are excluded from free bug-fix support and may be charged separately:</p>
<ul>
  <li>New features or modules not in the original Scope Document.</li>
  <li>Redesigns or changes to previously approved design/functionality.</li>
  <li>Content changes and data entry.</li>
  <li>New third-party integrations.</li>
  <li>Issues caused by changes made by third-party providers.</li>
</ul>
<p>Ongoing maintenance, security updates, hosting management and future development beyond the included support period may be provided under a separate agreement or quotation.</p>`,
  },
  {
    id: "rental-mgmt",
    name: "Rental Management Website Agreement",
    description: "Tailored for property rental websites, booking engines and tenant management systems.",
    title: "Rental Management Website & Client Portal Development Agreement",
    scope:
      "Design and end-to-end full-stack development of a high-performance Rental Management Website, tenant portal, property listings showcase, booking enquiry workflow, responsive mobile-friendly UI, admin dashboard, and cloud deployment on production infrastructure.",
    defaultAdvancePercentage: 40,
    body: `<h3>1. Purpose & Scope of Work</h3>
<p>The Service Provider agrees to deliver a custom Rental Management Website & Administrative System. The system will encompass property listing pages, tenant inquiry workflows, search and filter features, responsive mobile-first UI/UX, and an administrative control panel.</p>

<h3>2. Development Phases & Milestones</h3>
<ul>
  <li><strong>Phase 1 — UI/UX Wireframing:</strong> Architecture layout, database schema design, and interactive design approval.</li>
  <li><strong>Phase 2 — Core Frontend & Backend Build:</strong> Property catalog, responsive components, API endpoints, and authentication.</li>
  <li><strong>Phase 3 — Integration & Testing:</strong> Inquiry forms, media gallery uploads, performance tuning, and cross-browser QA.</li>
  <li><strong>Phase 4 — Production Deployment:</strong> Custom domain setup, SSL certificate installation, and handover walkthrough.</li>
</ul>

<h3>3. Client Obligations</h3>
<p>The Client shall provide necessary text content, property details, images, brand assets, and domain/DNS access in a timely manner to maintain the agreed project schedule.</p>

<h3>4. Revisions & Acceptance</h3>
<p>The project includes up to two (2) rounds of revision during the testing phase. Final acceptance is confirmed upon sign-off and deployment to the Client's production domain.</p>`,
    terms: `<p><strong>1. Intellectual Property:</strong> Upon receipt of full and final payment, all custom code, graphical assets, and deployment files created specifically for this project shall be the exclusive property of the Client.</p>
<p><strong>2. Confidentiality:</strong> Both parties agree to maintain strict confidentiality regarding any proprietary business information, client records, technical designs, or commercial terms shared during the term of this engagement.</p>
<p><strong>3. Jurisdiction:</strong> Any disputes arising under this agreement shall be subject to the exclusive jurisdiction of the competent courts in Trichy, Tamil Nadu, India.</p>`,
    cancellation: `<p>If the Client terminates this agreement prior to project completion, the advance payment shall be non-refundable to cover initial labor and infrastructure costs incurred. In the event of termination by the Service Provider without cause, all advance funds received for uncompleted milestones shall be refunded within 14 business days.</p>`,
    support: `<p>The Service Provider provides thirty (30) calendar days of complimentary post-launch technical support covering bug fixes, server monitoring, and operational guidance starting immediately upon production deployment.</p>`,
  },
  {
    id: "website-dev",
    name: "Website Development Agreement",
    description: "Standard commercial contract for corporate websites, landing pages and web applications.",
    title: "Web Application & Digital Experience Development Agreement",
    scope:
      "Custom responsive website design, frontend and backend development, SEO optimization, contact/lead management integration, performance caching, and production cloud deployment.",
    defaultAdvancePercentage: 40,
    body: `<h3>1. Project Description</h3>
<p>The Service Provider agrees to design, develop, test, and deploy a bespoke website tailored to the Client's business objectives. The deliverables include responsive layouts, fast load speeds, SEO optimization, and secure API integrations.</p>

<h3>2. Key Deliverables</h3>
<ul>
  <li>Responsive, accessible frontend across desktop, tablet, and mobile viewports.</li>
  <li>Backend API services, secure form handling, and admin dashboard controls.</li>
  <li>Search engine metadata configuration, sitemap generator, and analytics tracking.</li>
  <li>Automated CI/CD pipeline and SSL deployment.</li>
</ul>

<h3>3. Timeline & Handover</h3>
<p>Delivery will proceed in structured sprints with weekly status updates. Final source code and hosting access will be transferred upon completion of the final payment milestone.</p>`,
    terms: `<p><strong>1. Code Ownership:</strong> Full ownership of custom source code is assigned to the Client upon final payment settlement.</p>
<p><strong>2. Third-Party Licenses:</strong> Open-source components and third-party APIs remain subject to their respective standard licenses.</p>
<p><strong>3. Jurisdiction:</strong> Any disputes arising under this agreement shall be subject to the exclusive jurisdiction of the competent courts in Trichy, Tamil Nadu, India.</p>`,
    cancellation: `<p>Either party may terminate the agreement upon written notice. Work completed up to the date of termination shall be billed pro-rata against the advance payment.</p>`,
    support: `<p>Includes 30 days of standard warranty covering defect rectification, security patches, and deployment assistance.</p>`,
  },
  {
    id: "mobile-app",
    name: "Mobile App Development Agreement",
    description: "For iOS, Android, Flutter and React Native cross-platform mobile apps.",
    title: "Mobile Application Design & Engineering Agreement",
    scope:
      "Cross-platform mobile application development, UI/UX design, REST API backend integration, push notifications, offline caching, and App Store / Google Play Store release assistance.",
    defaultAdvancePercentage: 50,
    body: `<h3>1. Scope of Mobile Development</h3>
<p>The Service Provider will engineer a high-performance cross-platform mobile app including user authentication, state management, push notification services, and App Store compliance.</p>

<h3>2. Milestones</h3>
<ul>
  <li><strong>Milestone 1:</strong> UI/UX interactive prototype and Figma approval.</li>
  <li><strong>Milestone 2:</strong> Alpha build with core authentication and data synchronization.</li>
  <li><strong>Milestone 3:</strong> Beta release for TestFlight and internal Android testing.</li>
  <li><strong>Milestone 4:</strong> Production build generation and app store submission support.</li>
</ul>`,
    terms: `<p><strong>1. Developer Accounts:</strong> Client is responsible for maintaining active Apple Developer and Google Play Console accounts.</p>
<p><strong>2. App Store Approvals:</strong> While C2D Tech ensures standard guideline compliance, third-party store approval policies remain subject to Apple and Google's discretion.</p>`,
    cancellation: `<p>Advance payments are non-refundable once the design prototype milestone has been approved by the Client.</p>`,
    support: `<p>Includes 45 days of post-release monitoring for crash tracking and bug fixes.</p>`,
  },
  {
    id: "ai-automation",
    name: "AI & Automation Solution Agreement",
    description: "For LLM integrations, AI chatbots, automated workflows, and data pipelines.",
    title: "AI Automation System & Intelligent Agent Integration Agreement",
    scope:
      "Custom AI workflow automation, LLM model integration, secure vector embeddings database, custom knowledge base chatbot, and CRM / WhatsApp webhook automation.",
    defaultAdvancePercentage: 50,
    body: `<h3>1. AI System Overview</h3>
<p>Development and deployment of customized AI agentic systems and automated data workflows designed to accelerate business productivity and customer response times.</p>

<h3>2. Architecture & Data Privacy</h3>
<p>Client business data will be processed strictly through designated private endpoints with enterprise security policies. No proprietary client data will be used to train public foundation models.</p>`,
    terms: `<p><strong>1. API Consumption Costs:</strong> Underlying model tokens, API credits (e.g. OpenAI, Anthropic, Gemini, Claude), and cloud compute fees are billed directly to the Client's provider account.</p>
<p><strong>2. AI Output Disclaimer:</strong> The system utilizes probabilistic machine learning models; appropriate human oversight is recommended for critical business workflows.</p>`,
    cancellation: `<p>Termination requires 7 days written notice. Retainer and infrastructure setup fees are non-refundable.</p>`,
    support: `<p>Includes 30 days of prompt tuning, latency optimization, and pipeline health monitoring.</p>`,
  },
  {
    id: "maintenance-sla",
    name: "Maintenance & SLA Agreement",
    description: "For ongoing software maintenance, updates, uptime monitoring and support retainers.",
    title: "Software Maintenance & Technical SLA Agreement",
    scope:
      "Ongoing system maintenance, server uptime monitoring, security patching, database backups, dependency upgrades, and prioritized technical support.",
    defaultAdvancePercentage: 100,
    body: `<h3>1. Service Coverage</h3>
<p>Continuous operational support for the Client's web/mobile software infrastructure, including daily health checks, SSL renewals, vulnerability scanning, and error logging.</p>

<h3>2. Service Level Agreement (SLA)</h3>
<ul>
  <li>Critical Outage Response: Within 2 hours (24/7 coverage).</li>
  <li>Minor Defect Response: Within 24 business hours.</li>
  <li>Scheduled Maintenance: Performed during low-traffic maintenance windows with advance notification.</li>
</ul>`,
    terms: `<p><strong>1. Retainer Terms:</strong> Monthly or quarterly maintenance fees are payable in advance at the beginning of each billing cycle.</p>`,
    cancellation: `<p>Either party may cancel the recurring SLA agreement with thirty (30) days prior written notice.</p>`,
    support: `<p>Standard support available via email, phone, and priority Slack/WhatsApp channel.</p>`,
  },
  {
    id: "custom",
    name: "Custom Bespoke Agreement",
    description: "Start with a clean template for specialized software contracts and custom agreements.",
    title: "Master Services & Software Engineering Agreement",
    scope: "Enter custom project scope and deliverables here...",
    defaultAdvancePercentage: 40,
    body: `<h3>1. Scope of Services</h3>
<p>The Service Provider shall perform the services and deliver the software products detailed in the project specifications.</p>

<h3>2. Terms of Performance</h3>
<p>Work shall be performed in a professional, workmanlike manner adhering to modern engineering standards.</p>`,
    terms: `<p><strong>1. Standard Terms:</strong> Both parties agree to execute this agreement in good faith adhering to the governing jurisdiction of Trichy, Tamil Nadu, India.</p>`,
    cancellation: `<p>Standard cancellation terms apply as agreed by both parties.</p>`,
    support: `<p>Standard post-delivery support as specified in project milestones.</p>`,
  },
];

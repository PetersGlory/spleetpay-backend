const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const swaggerSpec = require('./swagger');
const platformSwaggerSpec = require('./platform-swagger');

module.exports = (app) => {
  // Serve Swagger documentation
  app.use('/api-docs', swaggerUi.serveFiles(swaggerSpec), swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true
    }
  }));

  
  // app.use('/platform', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  //   explorer: true,
  //   customCss: '.swagger-ui .topbar { display: none }',
  //   swaggerOptions: {
  //     persistAuthorization: true
  //   }
  // }));

  const customCss = `
      /* ── Hide the default Swagger topbar ── */
      .swagger-ui .topbar { display: none !important; }
  
      /* ── Custom header banner ── */
      .swagger-ui-wrap::before {
        content: '';
        display: block;
        height: 6px;
        background: linear-gradient(90deg, #6C3AE4 0%, #00C9A7 100%);
      }
  
      /* ── Brand colours ── */
      .swagger-ui .info .title        { color: #6C3AE4; font-size: 2rem; }
      .swagger-ui .info a             { color: #6C3AE4; }
      .swagger-ui .scheme-container   { background: #F6F4FF; padding: 16px; border-radius: 8px; }
  
      /* ── Tag headings ── */
      .swagger-ui .opblock-tag        { font-size: 1.1rem; border-bottom: 2px solid #6C3AE4; color: #1a1a2e; }
  
      /* ── POST → purple, GET → teal, DELETE → red, PUT → amber ── */
      .swagger-ui .opblock.opblock-post   { border-color: #6C3AE4; background: rgba(108,58,228,.05); }
      .swagger-ui .opblock.opblock-post   .opblock-summary-method { background: #6C3AE4; }
      .swagger-ui .opblock.opblock-get    { border-color: #00C9A7; background: rgba(0,201,167,.05); }
      .swagger-ui .opblock.opblock-get    .opblock-summary-method { background: #00C9A7; }
      .swagger-ui .opblock.opblock-delete { border-color: #E94560; background: rgba(233,69,96,.05); }
      .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #E94560; }
      .swagger-ui .opblock.opblock-put    { border-color: #F5A623; background: rgba(245,166,35,.05); }
      .swagger-ui .opblock.opblock-put    .opblock-summary-method { background: #F5A623; }
  
      /* ── Buttons ── */
      .swagger-ui .btn.authorize       { border-color: #6C3AE4; color: #6C3AE4; }
      .swagger-ui .btn.authorize svg   { fill: #6C3AE4; }
      .swagger-ui .btn.execute         { background: #6C3AE4; border-color: #6C3AE4; }
  
      /* ── Code blocks ── */
      .swagger-ui .highlight-code     { border-radius: 6px; }
    `;
  
    const customJs = `
      // Inject a branded header above the Swagger UI
      window.addEventListener('load', () => {
        const container = document.querySelector('#swagger-ui');
        if (!container) return;
  
        const banner = document.createElement('div');
        banner.style.cssText = [
          'display:flex', 'align-items:center', 'gap:14px',
          'padding:18px 24px', 'background:#1a1a2e', 'color:#fff',
          'font-family:Inter,system-ui,sans-serif'
        ].join(';');
  
        banner.innerHTML = \`
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#6C3AE4"/>
            <path d="M8 20 L16 10 L24 20" stroke="#00C9A7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="16" cy="22" r="2" fill="#00C9A7"/>
          </svg>
          <div>
            <div style="font-weight:700;font-size:1.1rem;letter-spacing:.5px;">SpleetPay Platform API</div>
            <div style="font-size:.78rem;opacity:.65;margin-top:2px;">
              Authenticate with your <code style="background:rgba(255,255,255,.15);padding:1px 5px;border-radius:4px;">X-API-Key</code> header
            </div>
          </div>
          <div style="margin-left:auto;font-size:.75rem;opacity:.5;">v1.0.0</div>
        \`;
  
        container.parentNode.insertBefore(banner, container);
      });
    `;
  
    app.use(
      '/platform-docs',
      swaggerUi.serveFiles(platformSwaggerSpec),
      swaggerUi.setup(platformSwaggerSpec, {
        explorer: false,
        customCss,
        customJs,
        customSiteTitle: 'SpleetPay Platform API',
        customfavIcon: '/favicon.ico',
        swaggerOptions: {
          persistAuthorization: true,
          defaultModelsExpandDepth: 1,
          defaultModelExpandDepth: 2,
          docExpansion: 'list',           // tags collapsed by default — easier to navigate
          filter: true,                   // enable the search bar
          displayRequestDuration: true,
          tryItOutEnabled: false,         // merchants should test in their own env first
          // Pre-fill the X-API-Key input label hint
          requestInterceptor: (req) => req
        }
      })
    );

};
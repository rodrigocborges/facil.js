export const Facil = {
  /**
   * Selects DOM elements and provides chainable utility methods.
   * @param {string|HTMLElement} selector - The CSS selector or HTML element.
   * @returns {Object} Chainable object with DOM manipulation methods.
   */
  dom: (selector) => {
    const els = typeof selector === 'string' ? document.querySelectorAll(selector) : [selector];
    
    return {
      on: (event, callback) => { els.forEach(el => el?.addEventListener(event, callback)); return Facil.dom(selector); },
      html: (content) => { els.forEach(el => { if(el) el.innerHTML = content; }); return Facil.dom(selector); },
      css: (styles) => { els.forEach(el => Object.assign(el?.style || {}, styles)); return Facil.dom(selector); },
      addClass: (cls) => { els.forEach(el => el?.classList.add(cls)); return Facil.dom(selector); },
      removeClass: (cls) => { els.forEach(el => el?.classList.remove(cls)); return Facil.dom(selector); }
    };
  },

  /**
   * Simple Pub/Sub event bus for global communication.
   */
  events: {
    _listeners: {},
    on: function(event, callback) {
      if (!this._listeners[event]) this._listeners[event] = [];
      this._listeners[event].push(callback);
    },
    emit: function(event, data) {
      if (this._listeners[event]) {
        this._listeners[event].forEach(callback => callback(data));
      }
    }
  },

  /**
   * UI utilities for loading states and skeletons.
   */
  ui: {
    _injectStyles: () => {
      if (document.getElementById('facil-styles')) return;
      const style = document.createElement('style');
      style.id = 'facil-styles';
      style.innerHTML = `
        /* Skeleton Shimmer */
        .f-skeleton {
          background: linear-gradient(90deg, #e0e0e0 25%, #f5f5f5 50%, #e0e0e0 75%) !important;
          background-size: 200% 100%;
          animation: f-shimmer 1.5s infinite;
          color: transparent !important;
          border-radius: 4px;
          pointer-events: none;
          user-select: none;
        }
        .f-skeleton * { visibility: hidden; }
        @keyframes f-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        
        /* Global Loader (Barra no topo) */
        .f-loader { position: fixed; top: 0; left: 0; right: 0; height: 3px; background: #007bff; z-index: 9999; animation: f-load 1s infinite; }
        @keyframes f-load { 0% { width: 0%; left: 0; } 50% { width: 100%; left: 0; } 100% { width: 0%; left: 100%; } }
      `;
      document.head.appendChild(style);
    },

    /**
     * Toggles skeleton loading state on elements within a container.
     * @param {string} selector - The container selector.
     * @param {boolean} [isActive=true] - Whether to show or hide the skeleton.
     */
    skeleton: (selector, isActive = true) => {
      Facil.ui._injectStyles();
      const container = document.querySelector(selector);
      if (!container) return;
      
      const elements = container.querySelectorAll('h1, h2, h3, h4, p, span, img, a, button');
      elements.forEach(el => {
        if (isActive) el.classList.add('f-skeleton');
        else el.classList.remove('f-skeleton');
      });
    },

    /**
     * Controls the global loading bar.
     */
    loading: {
      show: () => {
        Facil.ui._injectStyles();
        if (document.getElementById('f-global-loader')) return;
        const loader = document.createElement('div');
        loader.id = 'f-global-loader';
        loader.className = 'f-loader';
        document.body.appendChild(loader);
      },
      hide: () => {
        const loader = document.getElementById('f-global-loader');
        if (loader) loader.remove();
      }
    }
  },

  /**
   * HTTP client wrapper around fetch with automatic global loading support.
   */
  http: {
    /**
     * Performs an HTTP request.
     * @param {string} url - The URL to request.
     * @param {string} [method='GET'] - The HTTP method.
     * @param {Object|null} [data=null] - The request body data.
     * @param {boolean} [useLoader=true] - Whether to show the global loader.
     * @returns {Promise<any>} The JSON response.
     */
    request: async (url, method = 'GET', data = null, useLoader = true) => {
      if (useLoader) Facil.ui.loading.show();
      const options = { method, headers: { 'Content-Type': 'application/json' } };
      if (data) options.body = JSON.stringify(data);
      
      try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`Erro: ${response.status}`);
        return await response.json();
      } catch (error) {
        console.error('Facil HTTP Error:', error);
        throw error;
      } finally {
        if (useLoader) Facil.ui.loading.hide();
      }
    },
    get: (url, useLoader) => Facil.http.request(url, 'GET', null, useLoader),
    post: (url, data, useLoader) => Facil.http.request(url, 'POST', data, useLoader)
  },

  /**
   * Form utilities for serialization and validation.
   */
  form: {
    /** Default validation messages. */
    messages: {
      required: "The {field} field is required.",
      email: "The {field} field must be a valid email address.",
      min: "The {field} field must be at least {min} characters.",
      max: "The {field} field must not exceed {max} characters.",
      number: "The {field} field must be a valid number.",
      url: "The {field} field must be a valid URL.",
      match: "The {field} field must match the {matchField} field."
    },

    /**
     * Overrides or adds new validation messages.
     * @param {Object} newMessages - Key-value pairs of messages.
     */
    setMessages: (newMessages) => {
      Facil.form.messages = { ...Facil.form.messages, ...newMessages };
    },

    /**
     * Converts form data to a JSON object.
     * @param {string} selector - The form selector.
     * @returns {Object} The form data as an object.
     */
    toJSON: (selector) => {
      const form = document.querySelector(selector);
      if (!form) return {};
      const obj = {};
      new FormData(form).forEach((value, key) => {
        if (Reflect.has(obj, key)) {
          if (!Array.isArray(obj[key])) obj[key] = [obj[key]];
          obj[key].push(value);
        } else {
          obj[key] = value;
        }
      });
      return obj;
    },

    /**
     * Validates form data against a set of rules.
     * @param {string} selector - The form selector.
     * @param {Object} rules - Validation rules (e.g., { name: 'required|min:3' }).
     * @returns {Object} Result object { isValid, errors, data }.
     */
    validate: (selector, rules) => {
      const data = Facil.form.toJSON(selector);
      const errors = {};
      let isValid = true;

      // Helper to build the message replacing placeholders (e.g., {min})
      const getMsg = (ruleName, field, extra = {}) => {
        let msg = Facil.form.messages[ruleName] || `Invalid rule: ${ruleName}`;
        msg = msg.replace(/{field}/g, field);
        for (const [key, val] of Object.entries(extra)) {
          msg = msg.replace(new RegExp(`{${key}}`, 'g'), val);
        }
        return msg;
      };

      for (const [field, ruleString] of Object.entries(rules)) {
        const rulesArray = ruleString.split('|');
        const value = data[field] || '';
        
        for (const rule of rulesArray) {
          // Splits rule from parameter. E.g., "min:6" -> ruleName: "min", param: "6"
          const [ruleName, param] = rule.split(':');

          // Validations
          if (ruleName === 'required' && (!value || String(value).trim() === '')) {
            errors[field] = getMsg('required', field);
            isValid = false; break;
          }
          // If field is not required and is empty, skip subsequent rules
          if (!value && ruleName !== 'required') continue;

          if (ruleName === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors[field] = getMsg('email', field);
            isValid = false; break;
          }
          if (ruleName === 'min' && String(value).length < parseInt(param, 10)) {
            errors[field] = getMsg('min', field, { min: param });
            isValid = false; break;
          }
          if (ruleName === 'max' && String(value).length > parseInt(param, 10)) {
            errors[field] = getMsg('max', field, { max: param });
            isValid = false; break;
          }
          if (ruleName === 'number' && isNaN(Number(value))) {
            errors[field] = getMsg('number', field);
            isValid = false; break;
          }
          if (ruleName === 'url' && !/^https?:\/\/.+\..+/.test(value)) {
            errors[field] = getMsg('url', field);
            isValid = false; break;
          }
          if (ruleName === 'match' && value !== data[param]) {
            errors[field] = getMsg('match', field, { matchField: param });
            isValid = false; break;
          }
        }
      }
      
      return { isValid, errors, data };
    }
  },

  /**
   * Dark mode management with local storage persistence.
   */
  darkMode: {
    /** Initializes the theme based on system preference or local storage. */
    init: () => {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = localStorage.getItem('f-theme') || (isSystemDark ? 'dark' : 'light');
      
      document.documentElement.setAttribute('data-bs-theme', theme); //bootstrap 5 case
      document.documentElement.setAttribute('data-theme', theme);
    },
    /**
     * Toggles the current theme.
     * @returns {string} The new theme ('dark' or 'light').
     */
    toggle: () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-bs-theme', next);
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('f-theme', next);
      
      return next;
    }
  },

  /**
   * Simple template engine for string interpolation.
   */
  template: {
    /**
     * Interpolates variables into an HTML string.
     * @param {string} htmlString - The HTML template string.
     * @param {Object} data - The data object.
     * @returns {string} The parsed HTML string.
     */
    parse: (htmlString, data) => {
      return htmlString.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (match, key) => {
        return data[key] !== undefined ? data[key] : '';
      });
    }
  },

  /**
   * Creates a reactive state object that updates the DOM automatically.
   * @param {string} rootSelector - The container selector for the reactive scope.
   * @param {Object} initialData - The initial state object.
   * @returns {Proxy} The reactive proxy object.
   */
  reactive: (rootSelector, initialData) => {
    const root = document.querySelector(rootSelector);
    if (!root) return initialData;

    // Function that updates the DOM when data changes
    const updateDOM = (prop, value) => {
      // Updates text: <span f-text="name"></span>
      root.querySelectorAll(`[f-text="${prop}"]`).forEach(el => el.textContent = value);
      
      // Updates inputs (without messing up cursor if user is typing): <input f-model="name">
      root.querySelectorAll(`[f-model="${prop}"]`).forEach(el => {
        if (el.value !== String(value)) el.value = value;
      });
    };

    // Proxy intercepts variable changes
    const proxy = new Proxy(initialData, {
      set(target, prop, value) {
        target[prop] = value;
        updateDOM(prop, value); // Reflects in HTML automatically
        return true;
      }
    });

    // Listens to input typing (f-model) and updates Proxy
    root.querySelectorAll('[f-model]').forEach(el => {
      const prop = el.getAttribute('f-model');
      el.addEventListener('input', (e) => proxy[prop] = e.target.value);
      updateDOM(prop, proxy[prop]); // Initial state
    });

    // Updates text (f-text) with initial state
    Object.keys(proxy).forEach(prop => updateDOM(prop, proxy[prop]));

    return proxy;
  },

  /**
   * Client-side SPA router.
   */
  router: {
    routes: [],
    outlet: null,
    
    /**
     * Initializes the router.
     * @param {Object} config - Router configuration { outlet, routes }.
     */
    init: (config) => {
      Facil.router.routes = config.routes || [];
      Facil.router.outlet = document.querySelector(config.outlet);
      
      // Listen to browser back/forward buttons
      window.addEventListener('popstate', Facil.router.handleRoute);
      
      // Intercept clicks on links with "f-link" attribute
      document.body.addEventListener('click', e => {
        if (e.target.matches('[f-link]')) {
          e.preventDefault();
          Facil.router.navigate(e.target.getAttribute('href'));
        }
      });

      Facil.router.handleRoute(); // Render initial route
    },

    /**
     * Navigates to a specific path programmatically.
     * @param {string} path - The path to navigate to.
     */
    navigate: (path) => {
      window.history.pushState({}, '', path);
      Facil.router.handleRoute();
    },

    /**
     * Handles route changes and renders the appropriate template.
     */
    handleRoute: async () => {
      const path = window.location.pathname;
      const route = Facil.router.routes.find(r => r.path === path) || Facil.router.routes.find(r => r.path === '*');
      
      if (route && Facil.router.outlet) {
        // Can render direct HTML (string) or fetch an .html file
        if (route.templateUrl) {
          Facil.ui.loading.show();
          try {
            const html = await fetch(route.templateUrl).then(res => res.text());
            Facil.router.outlet.innerHTML = html;
          } catch (e) { console.error('Erro na rota:', e); } 
          finally { Facil.ui.loading.hide(); }
        } else if (route.template) {
          Facil.router.outlet.innerHTML = route.template;
        }
        
        // Execute route callback if exists
        if (route.onLoad) route.onLoad(); 
      }
    }
  }

};
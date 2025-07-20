// Authentication Controller
class AuthController {
  constructor() {
    this.currentUser = null
    this.isLoading = false
  }

  // Initialize auth controller
  init() {
    this.checkAuthStatus()
    this.bindEvents()
  }

  // Check if user is already authenticated
  checkAuthStatus() {
    const StorageService = window.StorageService // Declare StorageService
    if (StorageService.isAuthenticated()) {
      // If on login page and authenticated, redirect to dashboard
      if (window.location.pathname.includes("login.html")) {
        window.location.href = "/views/dashboard.html"
      }
    } else {
      // If not on login page and not authenticated, redirect to login
      if (!window.location.pathname.includes("login.html")) {
        window.location.href = "/views/login.html"
      }
    }
  }

  // Bind form events
  bindEvents() {
    const loginForm = document.getElementById("loginForm")
    const registerForm = document.getElementById("registerForm")

    if (loginForm) {
      loginForm.addEventListener("submit", (e) => this.handleLogin(e))
    }

    if (registerForm) {
      registerForm.addEventListener("submit", (e) => this.handleRegister(e))
    }
  }

  // Show login form
  showLogin() {
    document.getElementById("loginForm").classList.remove("hidden")
    document.getElementById("registerForm").classList.add("hidden")
    document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"))
    event.target.classList.add("active")
    this.clearMessages()
  }

  // Show register form
  showRegister() {
    document.getElementById("loginForm").classList.add("hidden")
    document.getElementById("registerForm").classList.remove("hidden")
    document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"))
    event.target.classList.add("active")
    this.clearMessages()
  }

  // Handle login form submission
  async handleLogin(event) {
    event.preventDefault()

    if (this.isLoading) return

    const formData = {
      email: document.getElementById("loginEmail").value.trim(),
      password: document.getElementById("loginPassword").value,
    }

    const ValidationService = window.ValidationService // Declare ValidationService
    // Validate form
    const validation = ValidationService.validateForm(formData, {
      email: [
        { type: "required", message: "Email is required" },
        { type: "email", message: "Please enter a valid email" },
      ],
      password: [{ type: "required", message: "Password is required" }],
    })

    if (!validation.isValid) {
      this.showValidationErrors(validation.errors)
      return
    }

    const apiService = window.apiService // Declare apiService
    try {
      this.setLoading(true, "loginBtn")
      this.clearMessages()

      const response = await apiService.post(window.CONFIG.ENDPOINTS.AUTH.LOGIN, formData) // Use window.CONFIG

      if (response.success) {
        // Store authentication data
        apiService.setToken(response.data.token)
        window.StorageService.setUser(response.data.user) // Use window.StorageService

        this.showMessage("Login successful! Redirecting...", "success")

        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = "/views/dashboard.html"
        }, 1500)
      }
    } catch (error) {
      this.showMessage(error.message || "Login failed. Please try again.", "error")
    } finally {
      this.setLoading(false, "loginBtn")
    }
  }

  // Handle register form submission
  async handleRegister(event) {
    event.preventDefault()

    if (this.isLoading) return

    const formData = {
      firstName: document.getElementById("firstName").value.trim(),
      lastName: document.getElementById("lastName").value.trim(),
      email: document.getElementById("registerEmail").value.trim(),
      dateOfBirth: document.getElementById("dateOfBirth").value,
      password: document.getElementById("registerPassword").value,
      confirmPassword: document.getElementById("confirmPassword").value,
    }

    const ValidationService = window.ValidationService // Declare ValidationService
    // Validate form
    const validation = ValidationService.validateForm(formData, {
      firstName: [
        { type: "required", message: "First name is required" },
        { type: "minLength", value: 2, message: "First name must be at least 2 characters" },
      ],
      lastName: [
        { type: "required", message: "Last name is required" },
        { type: "minLength", value: 2, message: "Last name must be at least 2 characters" },
      ],
      email: [
        { type: "required", message: "Email is required" },
        { type: "email", message: "Please enter a valid email" },
      ],
      dateOfBirth: [{ type: "required", message: "Date of birth is required" }],
      password: [
        { type: "required", message: "Password is required" },
        { type: "password", message: "Password must be at least 6 characters" },
      ],
    })

    // Check password confirmation
    if (formData.password !== formData.confirmPassword) {
      validation.errors.confirmPassword = "Passwords do not match"
      validation.isValid = false
    }

    // Check if date of birth is in the past
    if (formData.dateOfBirth && !ValidationService.isFutureDate(formData.dateOfBirth)) {
      // This is correct - date of birth should be in the past
    } else if (formData.dateOfBirth) {
      validation.errors.dateOfBirth = "Date of birth must be in the past"
      validation.isValid = false
    }

    if (!validation.isValid) {
      this.showValidationErrors(validation.errors)
      return
    }

    const apiService = window.apiService // Declare apiService
    try {
      this.setLoading(true, "registerBtn")
      this.clearMessages()

      // Remove confirmPassword from data sent to server
      const { confirmPassword, ...registerData } = formData

      const response = await apiService.post(window.CONFIG.ENDPOINTS.AUTH.REGISTER, registerData) // Use window.CONFIG

      if (response.success) {
        this.showMessage("Account created successfully! Please login.", "success")

        // Switch to login form after delay
        setTimeout(() => {
          this.showLogin()
          // Pre-fill email in login form
          document.getElementById("loginEmail").value = formData.email
        }, 2000)
      }
    } catch (error) {
      this.showMessage(error.message || "Registration failed. Please try again.", "error")
    } finally {
      this.setLoading(false, "registerBtn")
    }
  }

  // Logout user
  async logout() {
    const apiService = window.apiService // Declare apiService
    try {
      await apiService.post(window.CONFIG.ENDPOINTS.AUTH.LOGOUT) // Use window.CONFIG
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Clear local storage regardless of API call success
      apiService.removeToken()
      window.StorageService.clearAll() // Use window.StorageService
      window.location.href = "/views/login.html"
    }
  }

  // Show validation errors
  showValidationErrors(errors) {
    // Clear previous errors
    document.querySelectorAll(".form-error").forEach((el) => (el.textContent = ""))

    // Show new errors
    Object.keys(errors).forEach((field) => {
      const errorElement = document.getElementById(`${field}Error`)
      if (errorElement) {
        errorElement.textContent = errors[field]
      }
    })
  }

  // Show message to user
  showMessage(message, type = "info") {
    const container = document.getElementById("messageContainer")
    if (!container) return

    const messageDiv = document.createElement("div")
    messageDiv.className = `message message-${type}`
    messageDiv.textContent = message

    container.innerHTML = ""
    container.appendChild(messageDiv)

    // Auto-hide after delay
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove()
      }
    }, window.CONFIG.UI.TOAST_DURATION) // Use window.CONFIG
  }

  // Clear all messages
  clearMessages() {
    const container = document.getElementById("messageContainer")
    if (container) {
      container.innerHTML = ""
    }

    // Clear validation errors
    document.querySelectorAll(".form-error").forEach((el) => (el.textContent = ""))
  }

  // Set loading state
  setLoading(loading, buttonId) {
    this.isLoading = loading
    const button = document.getElementById(buttonId)

    if (button) {
      const textSpan = button.querySelector(".btn-text")
      const loaderSpan = button.querySelector(".btn-loader")

      if (loading) {
        button.disabled = true
        textSpan?.classList.add("hidden")
        loaderSpan?.classList.remove("hidden")
      } else {
        button.disabled = false
        textSpan?.classList.remove("hidden")
        loaderSpan?.classList.add("hidden")
      }
    }
  }

  // Show forgot password dialog
  showForgotPassword() {
    alert(
      "Forgot password functionality will be implemented. Please contact administrator at admin@internationalairlines.com",
    )
  }
}

// Create global auth controller instance
const authController = new AuthController()

// Reload page function
function reloadPage() {
  location.reload()
}

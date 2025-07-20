// Local Storage Utility Functions
const CONFIG = {
  STORAGE_KEYS: {
    TOKEN: "token",
    USER: "user",
    PREFERENCES: "preferences",
  },
}

class StorageService {
  // Token management
  static setToken(token) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, token)
  }

  static getToken() {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN)
  }

  static removeToken() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN)
  }

  // User data management
  static setUser(userData) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(userData))
  }

  static getUser() {
    const userData = localStorage.getItem(CONFIG.STORAGE_KEYS.USER)
    return userData ? JSON.parse(userData) : null
  }

  static removeUser() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER)
  }

  // Preferences management
  static setPreferences(preferences) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences))
  }

  static getPreferences() {
    const preferences = localStorage.getItem(CONFIG.STORAGE_KEYS.PREFERENCES)
    return preferences ? JSON.parse(preferences) : {}
  }

  // Clear all app data
  static clearAll() {
    Object.values(CONFIG.STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
  }

  // Check if user is authenticated
  static isAuthenticated() {
    const token = this.getToken()
    const user = this.getUser()
    return !!(token && user)
  }
}

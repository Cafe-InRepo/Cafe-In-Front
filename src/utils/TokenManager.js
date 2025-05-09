// utils/TokenManager.js
export class TokenManager {
  static KEY = "tableToken";
  static EXPIRY_KEY = "tableTokenExpiry";

  static setToken(token, expiresInMinutes = 5) {
    const expiry = Date.now() + expiresInMinutes * 60 * 1000;
    localStorage.setItem(this.KEY, token);
    localStorage.setItem(this.EXPIRY_KEY, expiry.toString());
  }

  static getToken() {
    const token = localStorage.getItem(this.KEY);
    const expiry = localStorage.getItem(this.EXPIRY_KEY);

    if (!token || !expiry || Date.now() > parseInt(expiry)) {
      this.clearToken();
      return null;
    }
    return token;
  }

  static clearToken() {
    localStorage.removeItem(this.KEY);
    localStorage.removeItem(this.EXPIRY_KEY);
  }

  static isValid() {
    return this.getToken() !== null;
  }
}

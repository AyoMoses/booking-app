export class User {
  constructor(
    public id: string,
    public email: string,
    // tslint:disable-next-line: variable-name
    private _token: string,
    private tokenExpirationDate: Date
  ) {}

  // WE CHECK TO SEE IF TOKEN VALIDATION IS STILL VALID
  get token() {
    if (!this.tokenExpirationDate || this.tokenExpirationDate <= new Date()) {
      return null;
    }
    return this._token;
  }

  get tokenDuration() {
    if (!this.token) {
      return 0;
    }
    return this.tokenExpirationDate.getTime() - new Date().getTime();
  }
}

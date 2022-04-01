import { Chaincode } from "fabric-contract-api";
import crypto from "crypto";

export const ShopManager = class extends Chaincode {
  constructor() {
    super("shop-manager");
  }

  async InitLedger(ctx) {
    const users = [
      {
        id: "ivan",
        fullName: "Ivanov Ivan Ivanovich",
        role: 4,
        maxRole: 4,
        secretHash: __keccak256("12345"),
        balance: 50,
      },
      {
        id: "vlad",
        fullName: "Vladov Vlad Vladovich",
        role: 0,
        maxRole: 0,
        secretHash: __keccak256("123"),
        balance: 100,
      },
    ];

    const shops = [
      {
        city: "dmitrov",
        balance: 1000,
      },
    ];

    await Promise.all([
      this.__putState(ctx, "users", users),
      this.__putState(ctx, "shops", shops),
    ]);
  }

  async Authenticate(ctx, secret) {
    const userId = this.__getID(ctx);
    const mspId = this.__getMSPID(ctx);
    let secretHash;

    switch (mspId) {
      case "UsersMSP":
        const users = await this.__getState(ctx, "users");
        secretHash = users.find((u) => u.id === userId).secretHash;
        break;
      case "ShopsMSP":
        const shops = await this.__getState(ctx, "shops");
        secretHash = shops.find((s) => s.city === userId).secretHash;
        break;
      case "BankMSP":
        if (userId === "bank") {
          const bank = await this.__getState(ctx, "bank");
          secretHash = bank.secretHash;
        }
    }

    if (!secretHash) throw new Error("User not registered!");

    return secretHash === __keccak256(secret);
  }

  async Register(ctx, fullName) {
    const mspId = this.__getMSPID(ctx);
    if (mspId !== "UsersMSP")
      throw new Error(
        "You can't self-register user that is not in Users organisation"
      );

    const userId = this.__getID(ctx);
    const users = await this.__getState(ctx, "users");
    if (users.find((u) => u.id === userId))
      throw new Error("You're already registered!");

    const secret = Buffer.from(
      ctx.stub.getTransient().get("secret")
    ).toString();

    const newUser = {
      id: userId,
      fullName,
      role: 0,
      maxRole: 0,
      secretHash: __keccak256(secret),
      balance: 0,
    };
  }

  static __keccak256(value) {
    return crypto.createHash("sha3-256").update(value).digest("hex");
  }

  __getID(ctx) {
    return ctx.clientIdentity.getAttributeValue("hf.EnrollmentID");
  }

  __getMSPID(ctx) {
    return ctx.clientIdentity.getMSPID();
  }

  async __getState(ctx, key) {
    const value = await ctx.stub.getState(key);
    if (!value) return null;
    return JSON.parse(Buffer.from(value));
  }

  async __putState(ctx, key, value) {
    const newValue = Buffer.from(JSON.stringify(value));
    await ctx.stub.putState(key, newValue);
  }
};

export const contracts = [ShopManager];

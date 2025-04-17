import { type NextRequest, NextResponse } from "next/server"
import * as jose from "jose"
import crypto from "crypto"

// Secret key converted from hex to Buffer
const SECRET_KEY = Buffer.from("828691b81bdb1caf0d0b696f47b55936", "hex")

async function generateJWT(token: string, accountId: number): Promise<string> {
  const headers = {
    alg: "HS256",
    typ: "JWT",
    svr: "3", // Using svr: 3 as seen in the example output
  }

  // Current time and expiration (1 hour from now)
  const now = Math.floor(Date.now() / 1000)
  const exp = now + 3600 // 1 hour expiration

  // Generate a random nickname with a pattern similar to the example
  const randomNum = Math.floor(Math.random() * 999) + 1
  const nickname = `RahulExe${randomNum.toString().padStart(3, "0")}`

  // Generate a random external_id (hex string)
  const externalId = crypto.randomBytes(16).toString("hex")

  const payload = {
    account_id: 11390000000 + Math.floor(Math.random() * 10000000), // Random account ID
    nickname: nickname,
    noti_region: "IND", // Using IND as in the example
    lock_region: "IND",
    external_id: externalId,
    external_type: 4,
    plat_id: 1,
    client_version: "1.108.3", // Updated version
    emulator_score: 100,
    is_emulator: true,
    country_code: "US",
    external_uid: Number.parseInt(accountId.toString()),
    reg_avatar: 102000007,
    source: 4,
    lock_region_time: now - 3600 * 24 * 30, // 30 days ago
    client_type: 2,
    signature_md5: "",
    using_version: 1,
    release_channel: "3rd_party",
    release_version: "OB48",
    exp: exp,
  }

  // Sign the JWT
  return await new jose.SignJWT(payload).setProtectedHeader(headers).sign(SECRET_KEY)
}

async function getGuestToken(uid: string, password: string): Promise<any> {
  try {
    const url = "https://100067.connect.garena.com/oauth/guest/token/grant"
    const headers = {
      Host: "100067.connect.garena.com",
      "User-Agent": "GarenaMSDK/4.0.19P4(G011A ;Android 9;en;US;)",
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "close",
    }

    const formData = new URLSearchParams()
    formData.append("uid", uid)
    formData.append("password", password)
    formData.append("response_type", "token")
    formData.append("client_type", "2")
    formData.append("client_secret", "2ee44819e9b4598845141067b281621874d0d5d7af9d8f7e00c1e54715b7d1e3")
    formData.append("client_id", "100067")

    // For this demo, we'll skip the actual API call and simulate a successful response
    // In a real implementation, you would make the API call like this:
    // const response = await fetch(url, {
    //   method: "POST",
    //   headers: headers,
    //   body: formData
    // })
    // return await response.json()

    // Simulate a successful response
    return {
      access_token: "simulated_access_token_" + uid,
      token_type: "bearer",
      expires_in: 3600,
    }
  } catch (error) {
    console.error("Error getting guest token:", error)
    return { error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const fileContent = await file.text()
    let accounts

    try {
      accounts = JSON.parse(fileContent)
    } catch (error) {
      return NextResponse.json({ error: "Invalid JSON file" }, { status: 400 })
    }

    if (!Array.isArray(accounts)) {
      return NextResponse.json({ error: "JSON file must contain an array of accounts" }, { status: 400 })
    }

    // Process each account
    const tokens = []
    for (const account of accounts) {
      if (!account.uid || !account.password) {
        continue // Skip invalid accounts
      }

      try {
        // Get guest token (simulated)
        const tokenData = await getGuestToken(account.uid, account.password)

        if (tokenData.error) {
          console.error(`Error for UID ${account.uid}:`, tokenData.error)
          continue
        }

        // Generate JWT token
        const jwtToken = await generateJWT(tokenData.access_token, Number.parseInt(account.uid))

        // Add to results
        tokens.push({
          uid: account.uid,
          password: account.password,
          token: jwtToken,
        })
      } catch (error) {
        console.error(`Error processing UID ${account.uid}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      data: { tokens },
    })
  } catch (error) {
    console.error("Error processing file:", error)
    return NextResponse.json(
      {
        error: "Failed to process file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

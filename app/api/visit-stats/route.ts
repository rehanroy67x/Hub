import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const playerId = searchParams.get("id")
    const region = searchParams.get("region") || "IND"

    if (!playerId) {
      return NextResponse.json(
        {
          status: "error",
          message: "Player ID is required",
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      )
    }

    // Construct the external API URL
    const apiUrl = `https://aruu-viit-2.vercel.app/visit?uid=${playerId}&region=${region}`

    console.log("Fetching visit stats from:", apiUrl)

    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      cache: "no-store", // Ensure we get fresh data
    })

    if (!response.ok) {
      throw new Error(`External API request failed with status code: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      status: "success",
      data: data,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Error in visit-stats API:", error)

    return NextResponse.json(
      {
        status: "error",
        message: `An unexpected error occurred: ${error.message}`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
